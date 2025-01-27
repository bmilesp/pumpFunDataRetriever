FROM ubuntu:latest

# Set the working directory
RUN apt-get update
RUN apt-get install -y \
build-essential \
pkg-config \
libudev-dev llvm libclang-dev \
protobuf-compiler libssl-dev
RUN apt-get install -y curl
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN . "/root/.cargo/env"
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
# Expose necessary ports for RPC and other services
EXPOSE 8899
EXPOSE 8900
RUN cd /root/.local/share/solana/install/active_release/bin && ls -la
ENV PATH /root/.local/share/solana/install/active_release/bin:$PATH
RUN mkdir /ledger
CMD ["solana-test-validator", "--ledger", "/ledger", "--limit-ledger-size", "2500", "--log-messages-bytes-limit", "100000000", "--warp-slot", "316730000" ] #10000 shreds ~ 500GB 
# , 