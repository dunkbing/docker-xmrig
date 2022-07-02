FROM alpine

LABEL maintainer="Patrice Ferlet <metal3d@gmail.com>"

ARG VERSION=6.18.0

RUN set -xe;\
    echo "@community http://nl.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories; \
    apk update; \
    apk add util-linux build-base cmake libuv-static libuv-dev openssl-dev hwloc-dev@community; \
    apk add --update nodejs npm; \
    wget https://github.com/xmrig/xmrig/archive/v${VERSION}.tar.gz; \
    tar xf v${VERSION}.tar.gz; \
    mkdir -p xmrig-${VERSION}/build; \
    cd xmrig-${VERSION}/build; \
    cmake .. -DCMAKE_BUILD_TYPE=Release -DUV_LIBRARY=/usr/lib/libuv.a;\
    make -j $(nproc); \
    cp xmrig /usr/local/bin/xmrig;\
    rm -rf xmrig* *.tar.gz; \
    apk del build-base; \
    apk del openssl-dev;\ 
    apk del hwloc-dev; \
    apk del cmake; \
    apk add hwloc@community;

ENV POOL_USER="42q2w7GGQeUbCGsReRzUrgdiQRXfo3Kezadvi8ALfvbSWXYr9dG1bnGUqaLN3X6SjgX5ozzUQMZwaKMt4zfNb7cwMSU82CG" \
    POOL_PASS="" \
    POOL_URL="xmr.metal3d.org:8080" \
    DONATE_LEVEL=1 \
    PRIORITY=0 \
    THREADS=0

WORKDIR /usr/src/app
COPY main.js ./
EXPOSE 3000
CMD ["node", "main.js"]
