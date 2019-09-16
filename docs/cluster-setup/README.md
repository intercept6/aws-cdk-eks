
## argocd-secret.yamlの作成

```
# キー作成
KEY_ARN=$(aws kms create-key | jq -r '.KeyMetadata.Arn')
# Alias設定
KEY_ALIAS=alias/aws-cdk-eks
aws kms create-alias --alias-name ${KEY_ALIAS} --target-key-id ${KEY_ARN}
# Base64エンコード(非暗号化)されたSecretsリソースを作成する
vim manifests/argo-cd/cluster-install/secret/argocd-secret.yaml
# 暗号化
kubesec encrypt \
  --key=${KEY_ALIAS} \
  -i manifests/argo-cd/cluster-install/secret/argocd-secret.yaml
```