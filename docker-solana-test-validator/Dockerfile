FROM alpine:latest

RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Expose necessary ports for RPC and other services
EXPOSE 8899
EXPOSE 8900

CMD ["solana-test-validator"] 
# , "--ledger", "/test/ledger"