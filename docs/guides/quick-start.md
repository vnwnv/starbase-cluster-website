---
sidebar_position: 1
---

# Quick Start

This is a quick start guide for using the project to deploy kubernetes on ProxmoxVE nodes.This quick start guide will create a cluster consist of:

- 2 Loadbalancer nodes
- 3 control plane nodes
- 1 worker node

## Prerequisite

This guide assume you have following things:

- A operational [ProxmoxVE](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview) cluster/node with preconfiged network
- Tools have been installed
  - [Terraform](https://developer.hashicorp.com/terraform)
  - [Ansible](https://www.ansible.com/)
- A ProxmoxVE token of root account
- Git clone the [starbase-cluster-k8s](https://github.com/vnwnv/starbase-cluster-k8s/tree/main) project

## Deployment

The deployment divided into 2 stages: create VMs and build cluster, corresponding to function of Terraform and Ansible.

### Create VMs

Go to the `infra` directory and copy the example tfvar configuration.

```bash
cp ./vars/tfvars.example ./your-values.auto.tfvars
```

Here are the things you need to modify:

| Name                                        | Describe                                  |
| ------------------------------------------- | ----------------------------------------- |
| `cloud_init_config.template.ssh_public_key` | SSH key will insert to new VMs            |
| All of the `datastore_id`                   | Where to storage the data                 |
| All of the `*_vm_config.network_devices`    | NICs of VMs                               |
| All of the `cloud_init_*_network_configs`   | How to allocate IP address                |
| `vms`                                       | FQDN of VMs                               |
| `available_nodes`                           | Name of ProxmoxVE nodes to deploy the VMs |
| `cloud_provider`                            | How to connect your ProxmoxVE nodes       |

After modified the fields above, you can initialize the terraform and run the deploy command.

```bash
terraform init
terraform apply
```

The apply command may need 5 minuites or more, be patient. After you get the success message. You can find there is a file named `inventory.gen`.

Make sure the nodes can connect each other with the FQDN. If the FQDN not work, replace all of FQDNs by IP address.

You also need uncomment `ansible_ssh_extra_args` and edit `ansible_ssh_private_key_file` with private key path in the inventory file.

### Build Cluster

Go to the `bootstrap` directory and copy the `inventory.gen` to here, and named it to `inventory`. Copy the files in tools_playbook to here.

```bash
cp ../infra/inventory.gen ./inventory
cp ./tools_playbook/* ./
```

Edit the `keepalived.virtual_ip` in `./vars/custom.yml`, it will be the HA address of control plane. Then deploy the cluster.

```bash
ansible-playbook -i inventory deploy.playbook.yml
```

## Play with cluster

After the `ansible` command, you will find there is a `/tmp/kubeconfig.yaml` file contain the credentials of cluster. Copy it to the `~/.kube/config` and try to get nodes.

```bash
kubectl get nodes -o wide
```

You shold install [kured](https://github.com/kubereboot/kured) to handle the autoreboot of kubernetes node.
