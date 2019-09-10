# cluster-autoscaler

このディレクトリでは cluster-autoscaler の manifest を管理します。

現在の cluster-autoscaler の manifest は v1.1.2 のリリースタグ の manifest を用いており、
bases ディレクトリの manifest は examples より fork しています。

* [kubernetes/autoscaler/releases/tag/cluster-autoscaler-1.15.0](https://github.com/kubernetes/autoscaler/releases/tag/cluster-autoscaler-1.15.0)

## Manifests

* [bases/cluster-autoscaler-autodiscover.yaml](./bases/cluster-autoscaler-autodiscover.yaml)
  * [cluster-autoscaler-1.15.0/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml](https://github.com/kubernetes/autoscaler/blob/cluster-autoscaler-1.15.0/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml)
