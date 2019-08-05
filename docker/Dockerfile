FROM circleci/node:10.16.0

ENV PIP_INSTALLER "https://bootstrap.pypa.io/get-pip.py"
ENV AWS_CLI_VERSION "1.16.191"

# Install awscli
RUN curl -s ${PIP_INSTALLER} | sudo python3
RUN sudo pip3 install --upgrade awscli==${AWS_CLI_VERSION}

# install kubectl
ENV KUBECTL_RELEASE_DATE "2019-06-11"
ENV KUBECTL_VERSION "1.13.7"

RUN sudo curl -so /usr/local/bin/kubectl https://amazon-eks.s3-us-west-2.amazonaws.com/${KUBECTL_VERSION}/${KUBECTL_RELEASE_DATE}/bin/linux/amd64/kubectl
RUN sudo chmod +x /usr/local/bin/kubectl

# install kustomize
ENV KUSTOMIZE_VERSION "3.1.0"

RUN sudo curl -so /usr/local/bin/kustomize https://github.com/kubernetes-sigs/kustomize/releases/download/v${KUSTOMIZE_VERSION}/kustomize_${KUSTOMIZE_VERSION}_linux_amd64
RUN sudo chmod +x /usr/local/bin/kustomize
