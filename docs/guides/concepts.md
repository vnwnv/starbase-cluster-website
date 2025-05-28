---
sidebar_position: 2
---

# Concepts

Before deployment begins, you can quickly familiarize yourself with some key concepts about the cluster through this document.

## How the Cluster is Deployed

The cluster deployment primarily relies on two tools: Terraform and Ansible. The former is used to create virtual machines, while the latter deploys the RKE2 cluster. All nodes are designed to use openSUSE MicroOS as the base system.

### Deployment Workflow

During the Terraform phase, the tool interacts with ProxmoxVE nodes, mainly performing the following tasks:

1. Downloads a MicroOS image pre-installed with cloud-init.
2. Renders the cloud-init configuration and uploads it to ProxmoxVE.
3. Deploys and starts the virtual machines.
4. Uses cloud-init to upgrade and perform basic configuration on the nodes.

During the Ansible phase, the tool interacts with the virtual machine nodes:

1. Deploys the first load balancer node.
2. Deploys the remaining load balancer nodes.
3. Deploys the first RKE2 server node.
4. Deploys the remaining server nodes.
5. Deploys the RKE2 agent nodes.

### Fully Decoupled Phases

Completely separating these two phases enhances flexibility, ensuring Terraform does not need to interact with the cluster's internal network. This is particularly useful when deploying virtual machines in complex network environments.

For example: virtual machines communicate via a 10 Gbps internal network or ProxmoxVE's SDN, while deployment nodes communicate with ProxmoxVE over the internet or a management network. In such cases, Terraform cannot access the internal cluster network without setting up a VPN or jump host. Here, the Ansible phase can be executed from a node within the cluster's internal network.

## Node Classification

Currently, all nodes are categorized into three types:

- External LoadBalancer nodes
- RKE2 server nodes
- RKE2 agent nodes

The cluster requires at least one RKE2 server node.

## External Load Balancer

This project plans to deploy an external load balancer for the cluster. Its purpose is to provide a highly available Kubernetes control plane, ensuring the cluster remains operational even if any server node goes offline. Typically, this load balancer consists of two nodes: one primary and one backup. A separate load balancer enhances cluster stability and ensures each node focuses solely on its designated tasks.

It is a Layer 2 load balancer implemented using [keepalived](https://github.com/acassen/keepalived) and [haproxy](https://github.com/haproxy/haproxy). The load balancer requires a virtual IP address to provide services. All agent nodes will communicate with server nodes via this IP. All load balancer nodes are configured for automatic updates and reboots, requiring no manual management.

By default, load balancers communicate using broadcast addresses to reduce configuration complexity. This project supports automatic unicast address configuration to minimize network traffic, but broadcast is generally preferred over unicast.

## Node Allocation

This project can automatically distribute virtual machines (VMs) evenly across physical nodes in a ProxmoxVE cluster, especially useful for ProxmoxVE clusters without high availability enabled. The allocation logic is as follows:

Assume the current ProxmoxVE cluster consists of three nodes: node01, node02, and node03.

- System images will be downloaded on all nodes.
- Each type of VM node and its corresponding cloud-init resources follow a round-robin rule based on the declared configuration order.

For example, if deploying 6 RKE2 server nodes, 3 RKE2 agent nodes, and 2 LoadBalancer nodes:

| Node   | Workload                          |
| ------ | --------------------------------- |
| node01 | server01, server04, agent01, lb01 |
| node02 | server02, server05, agent02, lb02 |
| node03 | server03, server06, agent03       |

You can also select specific ProxmoxVE nodes to restrict VM deployment to those chosen nodes.

## Distribution Selection

Currently, only openSUSE MicroOS with cloud-init pre-installed is supported. In theory, openSUSE Tumbleweed is also compatible. However, adding support for other general-purpose distributions is not complex—PRs are welcome.

Choosing openSUSE MicroOS over traditional general-purpose distributions offers several advantages:

- Atomic updates
- Automatic updates and rollbacks
- Updates do not interrupt running processes
- SELinux enabled by default
- Immutable system (read-only root)

In self-hosted environments, openSUSE MicroOS provides advantages over Talos or Flatcar Linux:

- Greater flexibility
- Easy addition of software packages to support various self-hosted environments
- Compatibility with different Kubernetes distributions
- Extensive package support via openSUSE OBS

For detailed information about openSUSE MicroOS, refer to the [official documentation](https://en.opensuse.org/Portal:MicroOS).

## Automatic Reboots and Reboot Windows

Load balancer nodes use [rebootmgr](https://github.com/SUSE/rebootmgr?tab=readme-ov-file#checking-if-a-reboot-is-requested) to notify systemd about reboots. For all RKE2 nodes, automatic reboots are disabled. Although Kubernetes automatically reschedules pods to other nodes when some go offline, this can cause unexpected pod restarts. Therefore, the cluster should deploy [kured](https://github.com/kubereboot/kured) to enable automatic reboots.

### rebootmgr

For all nodes using rebootmgr for reboots, time slots can be defined to generate reboot windows corresponding to `reboot_slots`, `minute_offsets`, and `window_duration` in Terraform configurations. For example:

```tfvars
reboot_slots    = [17, 18]
minute_offsets  = [0, 15, 30, 45]
window_duration = 1h
```

This generates eight reboot windows:

- 17:00–18:00
- 17:15–18:15
- 17:30–18:30
- 17:45–18:45
- 18:00–19:00
- 18:15–19:15
- 18:30–19:30
- 18:45–19:40

VMs of the same type will sequentially select their reboot windows from these time slots.

### kured

For nodes using kured, openSUSE MicroOS creates a `/var/run/reboot-needed` file when a reboot is required. Kured should monitor this file to control node reboots. Example configurations are located in the project's [charts/kured](https://github.com/vnwnv/starbase-cluster-k8s/tree/main/charts/kured) directory. For other configurations, refer to kured's [documentation](https://kured.dev/).

## Defining Nodes

The project supports customizing the number and configurations of various node types. Note: Nodes of the same type share identical VM configurations; different node types require separate definitions (see [example configuration file](https://github.com/vnwnv/starbase-cluster-k8s/blob/main/infra/vars/tfvars.example)).

## Node Initialization

Node initialization uses cloud-init primarily because it integrates easily with ProxmoxVE and reduces code complexity. Support for Combustion and Ignition is open for discussion—PRs are welcome. Cloud-init configurations are rendered by Terraform.

The openSUSE MicroOS image is designed to automatically expand partitions, so cloud-init's `growpart` and `resizefs` modules must be disabled. As a result, you may see cloud-init errors during the first boot—this is normal behavior. These modules are disabled via an initialization script temporarily stored at `/var/lib/cloud/scripts/per-instance/initialize.sh`. Each node executes this script once during initialization before deleting it.

Packages specified in the configuration are installed by cloud-init at this stage. Network settings are also configured by cloud-init using configurations rendered by Terraform.
