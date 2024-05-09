---
title: Migrating From OPNsense to Mikrotik
description: ""

categories: ""
tags:
  - Networking
  - Mikrotik
  - OPNsense
  - Hardware

img_path: assets/img/posts/2024-05-10-migrating-from-opnsense-to-mikrotik/
image:
  path: featured.webp
  lqip: ""  # TODO

date: 2024-05-10
---

Today, I'm excited to share with you a little tale from my Homelab adventures. You see, I recently made a decision—a decision to bid farewell to my trusty DIY firewall setup and embark on a journey with a new companion: the Mikrotik RB 5009UG+S+IN.

Now, why the switch, you ask? Well, grab a seat, and let me walk you through the story behind this upgrade. From the humble beginnings of my DIY server to the unboxing of the sleek Mikrotik device, we'll dive into the good, the bad, and the ugly!

## 🔩 Server Specs

<!-- TODO: picture server internals -->

So, let me give you the rundown of my current setup. Picture this: it's a DIY rig rocking nothing but the most powerful i5 6500 processor, cooled by the trusty Intel stock cooler. We're talking 8 gigs of RAM in the most optimal single-stick configuration and a pair of 256 GB NVMe SSDs snuggled up in a ZFS mirror for the OS.

<!-- TODO: picture case front with panel on -->

The whole shebang is housed in an InterTech 2U 20248 case, with a couple of 80mm Noctua fans keeping things cool and quiet. 

<!-- TODO: picture PSU -->

And let's not forget the power supply. It's all being powered by the BeQuiet 300W PSU. Initially, it was double-sided velcro taped to the side of the case but now securely bolted in with a 3D-printed bracket thanks to one of my buddies that has a 3D printer.

<!-- TODO: picture case from the back showing the network ports and the PSU mounting bracket -->

Finally, onto networking. We've got the onboard Intel NIC as our WAN port and a dual-port Intel add-in NIC doing double duty as a LAGG for the LAN. All of my other networks are VLANs attached to this LAGG. Oh, and there's another single-port NIC reserved for emergencies, because, well, better safe than sorry! 😅

### 📖 Story Time...

This server has been through quite the journey. It started life as an HP prebuilt back in my high school days, packing the same i5 under the hood. Back then, Dad used it to bribe me to learn programming. From being my trusty desktop to morphing into an ESXi host, then Proxmox, then pfSense, and finally settling down as OPNsense – it's seen it all! Unfortunately, the motherboard in the original system died, but the CPU and memory are still going strong all these years (8 at this point) later.

But let's get back on track. Time to introduce the star of our upgrade saga.

## 📦 Unboxing and Overview

Enter the Mikrotik RB 5009UG+S+IN – a slick, low-power routerOS device with a nifty array of ports, including some 10-gigabit connectivity!

<!-- TODO: picture front side -->

First off, starting from the front of the device we've got:

- a DC Power Input, taking anything from 24 to 57V,
- a 10 gigabit SFP+ port, 
- a USB 3.0 type A port, 
- a 2.5 gigabit RJ45 port, supporting PoE input,
- 7 more 1-gigabit ethernet ports

<!-- TODO: picture left side -->

Moving on to the left side, we have a DV terminal power input. If you're paying attention, this makes it the 3rd powering option for this device. We have a DC power jack, a DC terminal, and PoE in on port 1!

<!-- TODO: picture back-right corner -->

Other than that, we have a pretty chonky heatsink that is visible on the back of the device, and nothing of interest really on the right side.

<!-- TODO: picture K-75 -->

If you're feeling fancy, Mikrotik offers a rack mount kit called the K-75, letting you stack up to 4 of these babies in a single rack unit. Of course, I don't need 4 routers in my homelab, but I still got one so I can nicely mount this one in my rack.

Now, let's peek under the hood. We're looking at a 64-bit quad-core ARM Cortex A72 chip, chugging along at 1.4GHz. Plus, 1GB of RAM and 1GB of NAND storage – not too shabby for a routing platform! I **think** this is actually the same chip and memory combo we get in the 1Gb Raspberry Pi 4, but I could be wrong on this one.

## ❓ Why am I Upgrading?

Now, you might be wondering why I'm ditching my DIY setup for this purpose-built beauty. Well, hear me out. Sure, the old rig technically packs more punch on paper, but there are a few reasons I'm making the switch:

1. **Cool, Quiet, and Efficient**: 

    The Mikrotik, being passively cooled, runs cool without making a peep - perfect for my bedroom rack setup. Unlike my noisy NAS, I can keep this one on 24/7.

2. **Space Saver**: 

    As time goes on and my rack slowly but surely fills up, I'm all about efficiency. Dedicating 2U of precious rack space just for a router feels a bit excessive. Time to free up some room for other projects! It is also much easier to mount this to the back of my rack if I ever decide to do that, as it does not need rails in order to slide into the rack.

3. **Automation Awesomeness**: 

    Mikrotik's got some serious automation potential, all thanks to the Terraform support. I've never been able to get my network automation quite right, but this time I'm hopeful I managed to find the right solution!

So yeah, while I could geek out over performance tests and power consumption stats, let's keep it real – this upgrade is all about convenience, space-saving, and embracing the future of network automation. Initially, I was planning to run performance tests on both systems to compare them. I wanted to showcase the difference both in terms of power consumption and actual performance. Then I started actually working on this and I realized how silly that idea is. Let me explain.

### ⏱️ Performance

So, my old router? Picture this: it's got a quad-core i5 6500 chip running at 3.3 GHz, with 8 GB of RAM. And each network port? It's cruising along at 1 GB. Now, I mainly use it for regular internet stuff and VPN. No fancy security features, just basic DNS and DHCP. It handles the load like a champ, hitting the max speed without breaking a sweat. So, running performance tests? Seems kinda pointless since they'd just max out at 1 GB anyway.

Now, let's talk about the new kid on the block.

The Mikrotik? It's got a quad-core ARM chip ticking away at 1.4 GHz and 1 GB of RAM. Pretty similar to a Raspberry Pi 4 in terms of specs. Again, it'll breeze through those 1Gb tests, hitting the same ceiling as the old router.

Sure, the Mikrotik has a 2.5Gb and a 10Gb connection, but here's the kicker—I don't have any other devices that can handle those speeds. So, those tests? Not happening. And honestly, within my network, there's not much traffic pushing past 1 GB anyway. The heavy lifting happens elsewhere, mainly on the switch. Plus, my internet speed caps out at 300 symmetrical, so there's no real benefit to going beyond 1 GB.

Long story short? Performance-wise, both routers are in the same boat. It's not about their horsepower—it's about the network's limits.

### ⚡ Power Consumption

Now that we've covered performance, let's talk about Watts.

<!-- TODO: picture kill-a-watt reading from OPNsense split screen with Mikrotik -->

Originally, I had plans to stress-test both systems and compare their power consumption to highlight Mikrotik's efficiency. But then, I hooked up my old router to a Kill-A-Watt meter, and boy oh boy, was I in for a surprise. Just by being plugged in (not even turned on), it was slurping up about 5 watts of power. And during boot-up, that number skyrocketed to around 50 watts, before settling at a more modest 30-35 watts during idle.

In contrast, the new Mikrotik comes with a 12V 2A power supply, capping its maximum draw at 24 watts. Typically, it hovers around 8 watts during idle. So, you see, there's not much point in putting them through the stress tests when the old router's idle draw is a whopping 50% higher than the new one's max potential. 

Oh, and a little disclaimer: those power consumption figures I mentioned? Well, the Mikrotik was hard at work, serving as my main router with 7 out of the 9 interfaces humming along, while the old OPNsense box was just idling with nothing to do (no network cables plugged in).

With that said, let's move on to the juicy stuff. The real reason I was itching to make this upgrade and hop aboard the Mikrotik train? It's all about their routerOS, specifically the Terraform support it has.

### 🤖 Automation Support

As I've been messing around - both in my homelab and in my professional work as a DevOps engineer - playing with all kinds of tech, I've really gotten into automation and GitOps. Here's the hitch: OPNsense relies on this clunky XML file for its setup, and there's no proper API to make tinkering with it a breeze.

Over the years, I've tried to get clever with Ansible, writing roles and playbooks to automate things. That, however, has always been a bit of a headache. Some of the config changes would be picked up on the fly, and some would not. I'd have to reboot my firewall when changes were made to the config for them to actually be picked up. And you know how lovely it is when your firewall is down and your internet access is gone... Not to mention that messing with the insides of that XML file feels like performing open-heart surgery — I'm always worried about pulling the wrong lever and breaking the whole setup.

<!-- TODO: picture of Cisco Switches stacked -->

Then there's my Cisco gear. I've got these SG300 and SG350 switches, but they're not as user-friendly as I'd hoped. They both support Cisco's IOS, but only a limited version of it. The Ansible module that is available for them is a bit... meh. It really only allows me to send CLI commands to the devices and that's about it. No idempotence or anything at all. I'd have to implement that myself!

Now don't get me wrong. If you do shell out for proper Cisco gear, there are actually good modules out there for network automation. I, however, refuse to get an old Catalyst that's both loud and power-hungry to gain access to those features.

<!-- TODO: screenshot of terraform provider page??? -->

Relatively recently, I stumbled upon something interesting: Terraform for Mikrotik. And since Terraform plays nice with my GitOps setup, I thought, "Why not give it a whirl?". Thus, here I am, testing the waters! 

If I can get this Mikrotik device to sing the automation tune I want, who knows? Maybe I'll turn my whole setup into a symphony! 😉

## ▶️ Getting Started

In this blog post, we're not diving deep into the nitty-gritty of Terraform code and configuration. Consider it more of an unboxing, overview, and a bit of a venting session. I've already got the ball rolling on the next part of this mini-series, where I'll walk you through the initial setup steps.

<!-- TODO: picture Mikrotik mounted into the rack, no cables -->

That said, let's roll up our sleeves and get this bad boy mounted into the rack and wired up.

### ⚙️ Default Configuration

By default, the first network port, the 2.5 GB one, is configured as the uplink, and all other ports are bridged together in the LAN network.

<!-- TODO: picture mikrotik cables plugged in -->

I'll plug in my uplink in the first one then, and my PC in the 2nd port. By default, Mikrotik has a DHCP server configured to hand out addresses in the <> range. The IP of the device is <> and we can configure it either via the webUI or via WinBox.

<!-- TODO: screenshot winbox print config -->

Taking a further look at the config that is loaded by default, we can see there's really not much there. We have our WAN and LAN networks, the port mappings to them, and the bridge interface to bridge together all the LAN ports. Also, we have NAT already set up so that we can access the internet and DHCP so that clients can be plugged in and get a connection right away.

Other than that, there's not much else.

## ☁️ Final Thoughts

And there you have it! We've unboxed the Mikrotik, talked about why I made the switch and got the device mounted into the rack. Next up, we'll dive into setting up automation with Terraform. So stay tuned!

Thanks for hanging out, and catch you in the next one! Cheers 👋
