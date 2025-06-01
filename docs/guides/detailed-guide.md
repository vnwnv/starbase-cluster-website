---
sidebar_position: 3
---

# Detailed Guide

Here is a detailed guide for deploying the cluster. Please read the Concept chapter first.

## Planning the Cluster

If you're a beginner, here are some recommendations for planning your cluster:

### Node Count

Even with limited physical servers, using more virtual nodes than physical ones can provide benefits:

- Separating the control plane from worker nodes ensures the cluster remains functional under high load
- Effectively reduces the impact of VM-level single points of failure on the cluster

We recommend deploying at least 2 virtual nodes per PVE node based on resource utilization.

### Storage

Storage requires careful consideration when planning a Kubernetes cluster. Recommended solutions include:

- Longhorn
- Rook
- democratic-csi with NAS server

:::warning

Carefully evaluate whether you can accept inability to automatically recover after unexpected power outages. And always maintain proper backups

:::

:::warning

Use iSCSI instead of NFS/SMB protocols which cannot meet Sqlite's read/write requirements and may cause errors in Sqlite-based workloads

:::

### Networking

For production environments with heavy I/O workloads:

- Use at least 2.5Gbps connections between all nodes
- For homelabs, 1Gbps is acceptable but higher bandwidth improves performance for network-based storage

The project supports configuring multiple NICs per VM to connect to different networks.

### Other Resources

Refer to:

- [RKE2 Requirements](https://docs.rke2.io/install/requirements)
- Your actual hardware specifications

Minimum recommendation:

- Avoid allocating less than 4GB RAM per VM to prevent OOM kills of container processes

Note: VM-level high availability isn't mandatory. The project works fine on ProxmoxVE without HA configuration. When hardware resources are limited, avoid using ProxmoxVE HA as it prevents Kubernetes from detecting physical node failures, potentially causing pod over-scheduling to remaining nodes.

### Planning Worksheet

Before deployment, organize your nodes in a table like this example:

**Physical Nodes**
| Node | IP Addresses |
|------|--------------|
| node0 | `10.0.0.10/24`, `192.168.1.10/24` |
| node1 | `10.0.0.11/24`, `192.168.1.11/24` |
| node2 | `10.0.0.12/24`, `192.168.1.12/24` |

**RKE2 Cluster**
| Node Type | IP Range |
|-----------|----------|
| Control Plane | `192.168.1.20-192.168.1.29/24` |
| Worker Nodes | `192.168.1.30-192.168.1.39/24` |
| External Load Balancer | `192.168.1.40-192.168.1.44/24` |
| Internal Load Balancer | `192.168.1.45-192.168.1.50/24` |
| ... | ... |

## Environment Preparation

Ensure you have a functioning ProxmoxVE cluster/node.

### Software Installation

You'll need at least Ansible and Terraform installed:

- Ansible must run on Linux
- Installation guides:
  - [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
  - [Terraform](https://developer.hashicorp.com/terraform/install)

Clone the project:

```bash
git clone https://github.com/vnwnv/starbase-cluster-k8s.git
```

## Deployment

### Deploying VMs

Enter the infra directory and copy the example config:

```bash
cd starbase-cluster/infra
cp vars/tfvars.example your-cluster-terraform.tfvars
```

Configure the file using references to:

   - [Example Config](https://github.com/vnwnv/starbase-cluster-k8s/blob/main/infra/vars/tfvars.example)
   - [Quick Start/Create VMs](https://vnwnv.github.io/starbase-cluster-website/docs/guides/quick-start#create-vms)
   - [Config Documentation](https://vnwnv.github.io/starbase-cluster-website/docs/documents/terraform-values)

Initialize Terraform plugins and deploy VMs:

```bash
terraform init
terraform apply
```

Deployment may take time because `qemu-agent` is enabled by default but not pre-installed in openSUSE MicroOS images. Terraform will wait until cloud-init installs it. Monitor progress via ProxmoxVE's noVNC interface.

After completion, you'll find an `inventory.gen` file for the next step.

:::tip Tip

Use [Terraform workspaces](https://developer.hashicorp.com/terraform/cli/workspaces) to manage multiple clusters simultaneously.

:::

### Building the Cluster

:::tip Tip

VMs are now initialized but the cluster isn't deployed yet - this is the time to add any custom tasks.

:::

Ensure your Ansible node can SSH into all cluster nodes.Enter the bootstrap directory and copy files:

```bash
cd starbase-cluster/bootstrap
cp ../infra/inventory.gen ./inventory
cp ./tools_playbook/* ./
```

If your network has proper DNS search domains allowing FQDN resolution, no changes are needed. Otherwise, replace all FQDNs in inventory with IP addresses.

The Ansible deployment uses a `deploy_rke2` Role configured through variable files, you can find these files in the `tools_playbook`

- Example config: `vars/custom.yml`
- Two playbooks:
  - `import.playbook.yml`: For importing fingerprints (recommended but optional)
  - `deploy.playbook.yml`: Main deployment playbook

Edit `custom.yml` by refering:

- [Quick Start/build-cluster](https://vnwnv.github.io/starbase-cluster-website/docs/guides/quick-start#build-cluster)
- [Config Documentation](https://vnwnv.github.io/starbase-cluster-website/docs/documents/ansible-role-values)

Modify inventory by uncommenting the `ansible_ssh_extra_args` line, then run:

```bash
ansible-playbook -i inventory import.playbook.yml
```

Re-comment the line and deploy the cluster:

```bash
ansible-playbook -i inventory deploy.playbook.yml
```

## Connecting to the Cluster

After deployment, you can find `/tmp/kubeconfig.yaml` on the Ansible host containing cluster credentials. Copy to `~/.kube/config` to start using kubectl:

```bash
kubectl get nodes -o wide
```

If lost, retrieve from any server node at `/etc/rancher/rke2/rke2.yaml`.
