---
sidebar_position: 1
---

# Terraform Variables

## Cloud-init Configuration

| Variable                                                  | Default                                                                  | Type         | Description                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `cloud_init_config.datastore_id`                          | `"local"`                                                                | string       | ProxmoxVE datastore ID, you can find it in the ProxmoxVE web UI                                                             |
| `cloud_init_config.template.dns_servers`                  | `[]`                                                                     | list         | List of DNS servers to use (e.g., `["1.1.1.1", "8.8.8.8"]` - suggest leave blank and using DNS config on interface instead) |
| `cloud_init_config.template.ssh_public_key`               | `""`                                                                     | string       | SSH public key for authentication                                                                                           |
| `cloud_init_config.template.hashed_password`              | `""`                                                                     | string       | Hashed password for the root user (generate with `mkpasswd -m sha-512`) If you do not need login from noVNC, leave it blank |
| `cloud_init_config.template.packages`                     | `["qemu-guest-agent", "screen", "htop", "policycoreutils-python-utils"]` | list(string) | Default packages to install on every node                                                                                   |
| `cloud_init_config.template.window_duration`              | `"1h"`                                                                   | string       | Auto reboot window duration of rebootmgr (e.g., `"10m"` for 10 minuites)                                                    |
| `cloud_init_config.template.reboot_strategy.rke2_nodes`   | `"best-effort"`                                                          | string       | Reboot strategy of rebootmgr for RKE2 nodes                                                                                 |
| `cloud_init_config.template.reboot_strategy.lb_nodes`     | `"best-effort"`                                                          | string       | Reboot strategy of rebootmgr for load balancer nodes                                                                        |
| `cloud_init_config.template.change_repo`                  | `false`                                                                  | bool         | Disable default official repo and change to custom                                                                          |
| `cloud_init_config.template.repo_domain`                  | `"https://mirrors.bfsu.edu.cn/opensuse"`                                 | string       | Custom openSUSE zypper repository URL                                                                                       |
| `cloud_init_config.template.disable_rebootmgr.rke2_nodes` | `true`                                                                   | bool         | Disable auto reboot for RKE2 nodes (disable when using kured)                                                               |
| `cloud_init_config.template.disable_rebootmgr.lb_nodes`   | `false`                                                                  | bool         | Disable auto reboot for load balancer nodes                                                                                 |
| `cloud_init_config.template.reboot_slots`                 | `[17, 18, 19, 20, 21, 22]`                                               | list(number) | Hour time slots for reboot times. (hours in 24h format)                                                                     |
| `cloud_init_config.template.minute_offsets`               | `[0, 15, 30, 45]`                                                        | list(number) | Minute time slots for reboot times. Look for the [concept document](../guides/concepts.md) for more info                    |

## Network Configuration

### Control Plane Nodes

| Variable                                                                  | Default           | Type         | Description                                 |
| ------------------------------------------------------------------------- | ----------------- | ------------ | ------------------------------------------- |
| `cloud_init_controlplane_network_config.network_configs[].interface`      | -                 | string       | Network interface name (e.g. `"ens18"`)     |
| `cloud_init_controlplane_network_config.network_configs[].type`           | -                 | string       | Interface type (`"dhcp"` or `"static"`)     |
| `cloud_init_controlplane_network_config.network_configs[].base_ip`        | -                 | string       | IPv4 address segment (e.g. `"192.168.1.0"`) |
| `cloud_init_controlplane_network_config.network_configs[].gateway`        | -                 | string       | Gateway IP address                          |
| `cloud_init_controlplane_network_config.network_configs[].cidr_netmask`   | `24`              | number       | Network mask in CIDR notation               |
| `cloud_init_controlplane_network_config.network_configs[].offset`         | `1`               | number       | Starting IP offset for VMs                  |
| `cloud_init_controlplane_network_config.network_configs[].dns_search`     | `["lan"]`         | list(string) | DNS search domains                          |
| `cloud_init_controlplane_network_config.network_configs[].dns_nameserver` | `["192.168.1.1"]` | list(string) | DNS servers for interface                   |

### Worker Nodes

| Variable                                                    | Default | Type   | Description                       |
| ----------------------------------------------------------- | ------- | ------ | --------------------------------- |
| `cloud_init_worker_network_config.network_configs[].offset` | `10`    | number | Starting IP offset for worker VMs |

The other config variables are same as controlplane nodes.

### Load Balancer Nodes

| Variable                                                          | Default | Type   | Description                   |
| ----------------------------------------------------------------- | ------- | ------ | ----------------------------- |
| `cloud_init_loadbalancer_network_config.network_configs[].offset` | `20`    | number | Starting IP offset for LB VMs |

The other config variables are same as controlplane nodes.

## Proxmox Provider Settings

| Variable                         | Default | Type   | Description                                                         |
| -------------------------------- | ------- | ------ | ------------------------------------------------------------------- |
| `cloud_provider.endpoint`        | `""`    | string | Proxmox API endpoint (e.g., `"https://your-proxmox-server:8006"`)   |
| `cloud_provider.api_token`       | `""`    | string | Proxmox API token (format: `"USER@REALM!TOKENID=UUID"`)             |
| `cloud_provider.insecure`        | `true`  | bool   | Skip TLS verification (not recommended for production)              |
| `cloud_provider.ssh.agent`       | `true`  | bool   | Use SSH agent for provisioning, MUST set true for usage of snippets |
| `cloud_provider.ssh.username`    | `""`    | string | SSH username for VM access                                          |
| `cloud_provider.ssh.private_key` | `""`    | string | Path to SSH private key for VM access                               |

## VM Hardware Configurations

You can follow the [bpg/proxmox documents](https://registry.terraform.io/providers/bpg/proxmox/latest/docs/resources/virtual_environment_vm) to configure the hardware settings for your VMs. For now, the project only provide some enssential config parameters. If you need more configurations, please open an issue or create a PR.

### Control Plane Nodes

| Variable                                            | Default           | Type   | Description            |
| --------------------------------------------------- | ----------------- | ------ | ---------------------- |
| `controlplane_vm_config.stop_on_destroy`            | `true`            | bool   | Stop VM on destroy     |
| `controlplane_vm_config.vm_id_start`                | `210`             | number | Starting VM ID         |
| `controlplane_vm_config.pool_id`                    | `""`              | string | Proxmox pool ID        |
| `controlplane_vm_config.cpu_cores`                  | `2`               | number | Number of CPU cores    |
| `controlplane_vm_config.cpu_type`                   | `"x86-64-v2-AES"` | string | CPU type               |
| `controlplane_vm_config.mem_dedicated`              | `2048`            | number | Dedicated memory in MB |
| `controlplane_vm_config.mem_floating`               | `2048`            | number | Minimum memory in MB   |
| `controlplane_vm_config.disk_size`                  | `50`              | number | Disk size in GB        |
| `controlplane_vm_config.disk_datastore`             | `"local"`         | string | Disk datastore         |
| `controlplane_vm_config.network_devices[].bridge`   | `"vmbr1_210"`     | string | Network bridge         |
| `controlplane_vm_config.network_devices[].model`    | `"virtio"`        | string | NIC model              |
| `controlplane_vm_config.network_devices[].vlan_id`  | `100`             | number | VLAN ID                |
| `controlplane_vm_config.network_devices[].mtu`      | `1000`            | number | MTU size               |
| `controlplane_vm_config.network_devices[].firewall` | `false`           | bool   | Enable firewall        |
| `controlplane_vm_config.qemu_agent_enabled`         | `true`            | bool   | Enable QEMU agent      |

### Worker Nodes

| Variable                         | Default | Type   | Description            |
| -------------------------------- | ------- | ------ | ---------------------- |
| `worker_vm_config.vm_id_start`   | `220`   | number | Starting VM ID         |
| `worker_vm_config.mem_dedicated` | `2048`  | number | Dedicated memory in MB |
| `worker_vm_config.mem_floating`  | `2048`  | number | Minimum memory in MB   |

The other config variables are same as controlplane nodes.

### Load Balancer Nodes

| Variable                               | Default | Type   | Description            |
| -------------------------------------- | ------- | ------ | ---------------------- |
| `loadbalancer_vm_config.vm_id_start`   | `200`   | number | Starting VM ID         |
| `loadbalancer_vm_config.mem_dedicated` | `2048`  | number | Dedicated memory in MB |
| `loadbalancer_vm_config.mem_floating`  | `2048`  | number | Minimum memory in MB   |

The other config variables are same as controlplane nodes.

## Package Management

| Variable                                 | Default                     | Type         | Description                               |
| ---------------------------------------- | --------------------------- | ------------ | ----------------------------------------- |
| `rke2_cloud_init_extra_packages`         | `["rke2", "rke2-selinux"]`  | list(string) | Extra packages add to RKE2 nodes          |
| `loadbalancer_cloud_init_extra_packages` | `["haproxy", "keepalived"]` | list(string) | Extra packages add to load balancer nodes |

## Node Assignment

| Variable                 | Default                                                                                         | Type | Description                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------- |
| `available_nodes`        | `{"storage0-pve"="storage0-pve", "compute0-pve"="compute0-pve", "compute1-pve"="compute1-pve"}` | map  | PVE nodes for deployment (uses polling strategy). Key and value MUST same. |
| `vms.controlplane.nodes` | `{"control0"="ktest0.lan", "control1"="ktest1.lan", "control2"="ktest2.lan"}`                   | map  | Control plane VM names and FQDNs                                           |
| `vms.loadbalancer.nodes` | `{"lb0"="kload0.lan", "lb1"="kload1.lan"}`                                                      | map  | Load balancer VM names and FQDNs                                           |
| `vms.worker.nodes`       | `{"worker0"="kworker0.lan"}`                                                                    | map  | Worker node VM names and FQDNs                                             |
