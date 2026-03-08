# Docker Container Debugging Guide

Systematic approach to debugging Docker container issues using InfraClaude tools.

## Container Won't Start

1. Use `docker_list_containers` with `all: true` to find stopped/exited containers
2. Use `docker_inspect_container` to check:
   - Exit code (non-zero = error)
   - State and error message
   - Port bindings and volume mounts
3. Use `docker_container_logs` to see startup errors
4. Common issues:
   - **Exit code 1**: Application error — check logs
   - **Exit code 137**: OOMKilled — increase memory limit
   - **Exit code 139**: Segfault — check binary compatibility
   - **Port already in use**: Another container or process using the port

## High Resource Usage

1. Use `docker_container_stats` to see real-time CPU/memory/network
2. Look for:
   - CPU over 100% — may need CPU limits
   - Memory growing continuously — possible memory leak
   - High network I/O — check for chatty services
3. Compare with `docker_inspect_container` for configured limits

## Networking Issues

1. Use `docker_list_networks` to see available networks
2. Use `docker_inspect_network` to check which containers are connected
3. Common issues:
   - Containers on different networks can't communicate
   - DNS resolution failing — check container DNS settings
   - Port mapping incorrect — verify `-p` flags

## Docker Compose Issues

1. Use `docker_compose_ps` to check service status
2. Use `docker_compose_logs` for specific service logs
3. Check dependency ordering (depends_on)
4. Verify environment variables and volume mounts

## Image Issues

1. Use `docker_list_images` to check available images
2. Check image size — large images slow down deployment
3. Verify image tags — `:latest` can cause inconsistencies
4. Use `security_trivy_scan` to check for vulnerabilities
