# Use a single 32-capacity Bubblegum V2 tree

MatchFlash will provision one non-public Bubblegum V2 tree using the supported `maxDepth: 5`, `maxBufferSize: 8` configuration, for 32 commemorative cNFTs. It intentionally does not use a 16,384-capacity tree; immediately before mainnet creation, the provisioning command calculates the exact account size and rent-exempt lamports with the selected configuration and shows the cost before spending.
