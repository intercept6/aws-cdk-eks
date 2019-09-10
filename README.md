# aws-cdk-eks

## 概要

AWS CDKとArgo CDを使用してAmazon EKSをセットアップするサンプル

##セットアップ

```bash
git clone kmd2kmd/aws-cdk-eks
cd aws-cdk-eks
npm install
```

複合化されたシークレットマニフェストの生成
```bash
 kubesec decrypt manifests/argo-cd/cluster-install/secret/argocd-secret.yaml > manifests/argo-cd/cluster-install/secret/argocd-secret.decrypted.yaml
 ```

kubesecで使用するCMKの作成
```bash
KEY_ARN=$(aws kms create-key | jq -r '.KeyMetadata.Arn')
```

```bash
kubesec encrypt \
  --key="aws:${KEY_ARN}" \
  -i manifests/argo-cd/cluster-install/secret/argocd-secret.yaml
```

## コマンド

| コマンド | 説明 | 備考 |
| --- | --- | --- |
| `npm run build` | tsをjsにコンパイルする ||
| `npm run watch` | 変更を監視してコンパイルする ||
| `npm run cdk <<cdk sub command>>` | 任意のCDKサブコマンドを実行する || 
| `npm run cdk synth` | 生成されたCloudFormationテンプレートをcdk.outに出力する ||
| `npm run diff` | デプロイされたスタックを現在の状態と比較する ||
| `npm run test` | 生成されたCloudFormationをスナップショットテストする ||
| `npm run test_update` | スナップショットを更新する ||
| `npm run ci_diff` | デプロイされたスタックを現在の状態と比較する | CIツール上で使用 |
| `npm run ci_deploy` | このスタックをデフォルトのAWSアカウント/リージョンにデプロイする | CIツール上で使用 |

