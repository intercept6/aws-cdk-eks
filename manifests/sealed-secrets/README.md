# Sealed Secrets

このディレクトリでは sealed-secrets の manifest を管理します。

現在の kubernetes では sealed-secrets の設定にプロダクト固有の設定変更を加えていないため、
manifest は v0.7.0 のリリースページより fork して [bases ディレクトリ](./bases) に入れています。

* [bases/controller.yaml](./bases/controller.yaml)
* [bases/sealedsecret-crd.yaml](./bases/sealedsecret-crd.yaml)

Namespace は [bases](./bases) ディレクトリの [kustomization.yaml](./bases/kustomization.yaml) で `kube-system` になるように指定しています。

* [Release v0.7.0 · bitnami-labs/sealed-secrets](https://github.com/bitnami-labs/sealed-secrets/releases/tag/v0.7.0)
