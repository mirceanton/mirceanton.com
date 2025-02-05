---
title: Getting Started With Mikrotik and Terraform
description: Adopting your Mikrotik router to Terraform for automation and management.
tags:
  - terraform
  - mikrotik
image:
  path: /assets/img/posts/2025-02-12-mikrotik-terraform-getting-started/featured.webp
  lqip: /assets/img/posts/2025-02-12-mikrotik-terraform-getting-started/featured_lqip.webp
date: 2025-02-12
---


## Getting Started

When it comes to onboarding your router under Terraform, there are two main approaches, both having their own advantages and disadvantages. You can either:

1. Start from scratch by resetting your router with **no** default configuration;
2. Start from the default configuration and work your way up from there.

Starting from scratch might sound like a good idea since you get a headstart in managing everything using Terraform. It requires more careful planning, however, since it also means you will not have any internet access until you have configured your router. This means you will not be able to, for example, pull terraform providers or modules or push your state file to a remote backend.


## Default Configuration

### Ethernet Interfaces

```terraform
# =================================================================================================
# Ethernet Interfaces
# https://registry.terraform.io/providers/terraform-routeros/routeros/latest/docs/resources/interface_ethernet
# =================================================================================================
resource "routeros_interface_ethernet" "wan" {
  factory_name = "ether1"
  name         = "ether1"
  comment      = "Digi Uplink (PPPoE)"
  l2mtu        = 1514
}

resource "routeros_interface_ethernet" "living_room" {
  factory_name = "ether2"
  name         = "ether2"
  comment      = "Living Room Switch"
  l2mtu        = 1514
}

resource "routeros_interface_ethernet" "sploinkhole" {
  factory_name = "ether3"
  name         = "ether3"
  comment      = "Sploinkhole"
  l2mtu        = 1514
}

resource "routeros_interface_ethernet" "ether4" {
  factory_name = "ether4"
  name         = "ether4"
  disabled     = true
}

resource "routeros_interface_ethernet" "ether5" {
  factory_name = "ether5"
  name         = "ether5"
  disabled     = true
}

resource "routeros_interface_ethernet" "ether6" {
  factory_name = "ether6"
  name         = "ether6"
  disabled     = true
}

resource "routeros_interface_ethernet" "ether7" {
  factory_name = "ether7"
  name         = "ether7"
  disabled     = true
}

resource "routeros_interface_ethernet" "access_point" {
  factory_name = "ether8"
  name         = "ether8"
  comment      = "cAP AX"
  l2mtu        = 1514
}

resource "routeros_interface_ethernet" "sfp-sfpplus1" {
  factory_name             = "sfp-sfpplus1"
  name                     = "sfp-sfpplus1"
  disabled                 = true
  sfp_shutdown_temperature = 90
}
```

### Default Bridge

```terraform
# =================================================================================================
# Bridge Interfaces
# https://registry.terraform.io/providers/terraform-routeros/routeros/latest/docs/resources/interface_bridge
# =================================================================================================
resource "routeros_interface_bridge" "bridge" {
  name           = "bridge"
  comment        = ""
  disabled       = false
  vlan_filtering = true
}
```

### Bridge Ports

```terraform
# =================================================================================================
# Bridge Ports
# https://registry.terraform.io/providers/terraform-routeros/routeros/latest/docs/resources/interfa
# =================================================================================================ce_bridge_port
resource "routeros_interface_bridge_port" "living_room" {
  bridge    = routeros_interface_bridge.bridge.name
  interface = routeros_interface_ethernet.living_room.name
  comment   = routeros_interface_ethernet.living_room.comment
  pvid      = "1"
}
resource "routeros_interface_bridge_port" "sploinkhole" {
  bridge    = routeros_interface_bridge.bridge.name
  interface = routeros_interface_ethernet.sploinkhole.name
  comment   = routeros_interface_ethernet.sploinkhole.comment
  pvid      = routeros_interface_vlan.trusted.vlan_id
}
resource "routeros_interface_bridge_port" "access_point" {
  bridge    = routeros_interface_bridge.bridge.name
  interface = routeros_interface_ethernet.access_point.name
  comment   = routeros_interface_ethernet.access_point.comment
  pvid      = routeros_interface_vlan.servers.vlan_id
}
```

### Interface Lists

```terraform
# ================================================================================================
# Interface Lists
# https://registry.terraform.io/providers/terraform-routeros/routeros/latest/docs/resources/interface_list
# ================================================================================================
resource "routeros_interface_list" "wan" {
  name    = "WAN"
  comment = "All Public-Facing Interfaces"
}
resource "routeros_interface_list" "lan" {
  name    = "LAN"
  comment = "All Local Interfaces"
}
```

### Firewall Rules

```terraform
# =================================================================================================
# Firewall Rules
# https://registry.terraform.io/providers/terraform-routeros/routeros/latest/docs/resources/ip_firewall_filter
# =================================================================================================
resource "routeros_ip_firewall_filter" "accept_established_related_untracked" {
  action           = "accept"
  chain            = "input"
  comment          = "accept established, related, untracked"
  connection_state = "established,related,untracked"
  place_before     = routeros_ip_firewall_filter.drop_invalid.id
}

resource "routeros_ip_firewall_filter" "drop_invalid" {
  action           = "drop"
  chain            = "input"
  comment          = "drop invalid"
  connection_state = "invalid"
  place_before     = routeros_ip_firewall_filter.accept_icmp.id
}

resource "routeros_ip_firewall_filter" "accept_icmp" {
  action       = "accept"
  chain        = "input"
  comment      = "accept ICMP"
  protocol     = "icmp"
  place_before = routeros_ip_firewall_filter.capsman_accept_local_loopback.id
}

resource "routeros_ip_firewall_filter" "capsman_accept_local_loopback" {
  action       = "accept"
  chain        = "input"
  comment      = "accept to local loopback for capsman"
  dst_address  = "127.0.0.1"
  place_before = routeros_ip_firewall_filter.drop_all_not_lan.id
}

resource "routeros_ip_firewall_filter" "drop_all_not_lan" {
  action            = "drop"
  chain             = "input"
  comment           = "drop all not coming from LAN"
  in_interface_list = "!LAN"
  place_before      = routeros_ip_firewall_filter.accept_ipsec_policy_in.id
}

resource "routeros_ip_firewall_filter" "accept_ipsec_policy_in" {
  action       = "accept"
  chain        = "forward"
  comment      = "accept in ipsec policy"
  ipsec_policy = "in,ipsec"
  place_before = routeros_ip_firewall_filter.accept_ipsec_policy_out.id
}

resource "routeros_ip_firewall_filter" "accept_ipsec_policy_out" {
  action       = "accept"
  chain        = "forward"
  comment      = "accept out ipsec policy"
  ipsec_policy = "out,ipsec"
  place_before = routeros_ip_firewall_filter.fasttrack_connection.id
}

resource "routeros_ip_firewall_filter" "fasttrack_connection" {
  action           = "fasttrack-connection"
  chain            = "forward"
  comment          = "fasttrack"
  connection_state = "established,related"
  hw_offload       = "true"
  place_before     = routeros_ip_firewall_filter.accept_established_related_untracked_forward.id
}

resource "routeros_ip_firewall_filter" "accept_established_related_untracked_forward" {
  action           = "accept"
  chain            = "forward"
  comment          = "accept established, related, untracked"
  connection_state = "established,related,untracked"
  place_before     = routeros_ip_firewall_filter.drop_invalid_forward.id
}

resource "routeros_ip_firewall_filter" "drop_invalid_forward" {
  action           = "drop"
  chain            = "forward"
  comment          = "drop invalid"
  connection_state = "invalid"
  place_before     = routeros_ip_firewall_filter.drop_all_wan_not_dstnat.id
}

resource "routeros_ip_firewall_filter" "drop_all_wan_not_dstnat" {
  action               = "drop"
  chain                = "forward"
  comment              = "drop all from WAN not DSTNATed"
  connection_nat_state = "!dstnat"
  connection_state     = "new"
  in_interface_list    = "WAN"
}
```

### NAT

```terraform
# =================================================================================================
# NAT Rules
# https://registry.terraform.io/providers/terraform-routeros/routeros/latest/docs/resources/ip_firewall_nat
# =================================================================================================
resource "routeros_ip_firewall_nat" "wan" {
  comment            = "WAN masquerade"
  chain              = "srcnat"
  out_interface_list = "WAN"
  action             = "masquerade"
}
```

### PPPoE Client for WAN

```terraform
# =================================================================================================
# PPPoE Client
# https://registry.terraform.io/providers/terraform-routeros/routeros/latest/docs/resources/interface_pppoe_client
# =================================================================================================
resource "routeros_interface_pppoe_client" "digi" {
  interface         = routeros_interface_ethernet.wan.name
  name              = "PPPoE-Digi"
  comment           = "Digi PPPoE Client"
  add_default_route = true
  use_peer_dns      = false
  password          = var.digi_pppoe_password
  user              = var.digi_pppoe_username
}
```

### What about IPv6?

I'm going to get a lot of hate for this, but I'm going to keep it simple and just disable IPv6 on the router...

```terraform
# =================================================================================================
# IPv6 Settings
# https://registry.terraform.io/providers/terraform-routeros/routeros/latest/docs/resources/ipv6_settings
# =================================================================================================
resource "routeros_ipv6_settings" "disable" {
  disable_ipv6 = "true"
}
```

## Next Steps

I'm going to continue working on this setup and will add more resources as I go. If you have any questions or need further assistance, feel free to reach out! 

---

Happy Terraforming! 🚀