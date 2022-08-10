# bake using `docker buildx bake -f docker-bake.hcl` in the project root

group "default" {
    targets = ["base", "app"]
}

variable "FLAVOR" {
    # Can either be 'alpine' or 'ubuntu'
    default = "alpine"
}

target "base" {
    # dockerfile is relative to context `dist/src/`
    dockerfile = "../../docker/base-${FLAVOR}.dockerfile"
    context = "dist/src/"
    tags = ["ketchersvc:base-${FLAVOR}"]
}

target "app" {
    inherits = ["base"]
    dockerfile = "../../docker/app.dockerfile"
    context = "dist/src/"
    contexts = {
        base = "target:base"
    }
    tags = ["ketchersvc:latest-${FLAVOR}"]
}
