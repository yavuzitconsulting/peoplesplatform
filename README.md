# people's platform project
PLEASE NOTE: 
We deployed our Website and Api to https://www.caleidoscode.io.

The Website has an FAQ section, as well as a section that explains how to set up the extension that is not yet released in the chrome web store!

The default chain when visiting the website is our very own CryptNG Testnet.

Network Name: CryptNG-TestNet

RPC URL: https://testnet.cryptng.xyz:8545

Chain ID: 501984

Symbol: CETH

The deployed website and API also supports, and is working with, all other networks that we deployed to and are applying to!


## DEPLOYED TO THE FOLLOWING CHAINS

> **INFO**: We used EIP-2535 Diamond standard to make the contracts updateable. That means the verified smart contract PeoplesPlatformFacet is not called directly for transaction but the PeoplesPlatform_DiamondProxy contract´

| GNOSIS CHIADO CHAIN |   |
| --- | --- |
| Diamond Proxy Contract Address | 0xffC39C76C68834FE1149554Ccc1a76C2F1281beD |
| Diamond Proxy Transactions | [Gnosis Chiado Blockscout Contract Transactions](https://gnosis-chiado.blockscout.com/address/0xffC39C76C68834FE1149554Ccc1a76C2F1281beD) |
| Verified Contract Address | 0x41A9a3C9Ffb75b1020f882b4a4eB1cef8F3EA5AF |
| Exploerer Link | [Gnosis Chiado Blockscout verified Contract](https://gnosis-chiado.blockscout.com/address/0x41A9a3C9Ffb75b1020f882b4a4eB1cef8F3EA5AF?tab=contract) |
| Tweet | [ITLeaks tweets about Gnosis @ETHGlobal Istanbul Hackathon](https://twitter.com/ITLeaks/status/1726019292091625798) |

| SCROLL SEPOLIA CHAIN |   |
| --- | --- |
| Diamond Proxy Contract Address | 0x314AA36352771307E942FaeD6d8dfB2398916E92 |
| Diamond Proxy Transactions | [Scroll Sepolia Blockscout Contract Transactions](https://sepolia-blockscout.scroll.io/address/0x314AA36352771307E942FaeD6d8dfB2398916E92)|
| Verified Contract Address | 0xFC20482857782Ff1592C42d77b96e9d8698870F9 |
| Exploerer Link | [Scroll Sepolia Blockscout verified Contract](https://sepolia-blockscout.scroll.io/address/0xFC20482857782Ff1592C42d77b96e9d8698870F9/contracts#address-tabs) |

| NEON EVM DEV CHAIN |   |
| --- | --- |
| Diamond Proxy Contract Address | 0x9A1554a110A593b5C137643529FAA258a710245C |
| Diamond Proxy Transactions | [Neonscan Contract Transactions](https://devnet.neonscan.org/address/0x9A1554a110A593b5C137643529FAA258a710245C)|
| Verified Contract Address | 0xd351cA594a02a6C555D2DCe3Ad6Ebd6b5003904f |
| Exploerer Link | [Neonscan verified Contract](https://devnet.neonscan.org/address/0xd351cA594a02a6C555D2DCe3Ad6Ebd6b5003904f#contract) |


**Revive the Internet with the People's Platform Project! Our mission: to reclaim the social media landscape from advertiser domination. This project enables individuals to freely promote and support their favorite content and creators. It's a space where you can monetize your creative work without the restrictions of advertiser censorship.**

# Problem Statement
Social media today is dominated by advertisers, resulting in content that's tailored to their interests rather than the community's. This limits free speech and leads to a flood of simple, low-quality content. Large companies prioritize ad revenue over open and diverse content.
Content creators have to obey censorship and big tech rules to earn a living, and the users/community has to live with numbed down content.

# Solution
Our project aims to revolutionize the social media landscape by giving the power back to the community. We provide a solution that enables users to independently upvote and downvote content on various social media platforms using blockchain technology. 
Users up/downvotes contribute to show community interest and trends, they are not monetary transactions, but require gas.
Other users can be "contributors (donators)" that can contribute to a "supporter pool", from this pool, creators are paid out, a smart contract calculates a fair share over-time, based on up/downvote ratios (community interest).
This allows content creators to manage their content openly and sustainably. We introduce a website that supersedes the original social media sorting algorithm, reflecting the decentralized voting system's impact on content quality.

# Key Components
**People's Choice Extender** (Chrome Extension): Our planned extension integrates seamlessly with Metamask, adding extra upvote and downvote buttons to social media pages.

**People's Poll Protocol** (Solidity Smart Contract): The  smart contract includes a "supporter pool" for collecting and managing donations. Users can upvote or downvote content on social media, with the extension calling a function in the smart contract. The contract tracks the number of votes for each wallet. Content creators can receive a fair share of the donations based on their votes. 
A "DAO pool" may be introduced for any administrative work such as taking over transaction costs for creator payouts and at some point,possibly rewarding the users with tokens / crypto rewards.

**People's Pics Aggregator** (Vanilla Html Website): To override the original social media content sorting, we're developing a website that displays content based on the number of upvotes, giving more upvoted content higher visibility.

**People's Picker Api** (Nodejs Rest Api): Provides sorted and paginated content from different chains to the WebApp

# Howto to start

- Clone the repo and add the extension to Chrome. Follow the description @ [People's Choice Extender Doc](https://www.caleidoscode.io/extension.html) and connect your wallet on your prefered chain (Chiado, Scroll Sepolia, Neon Devnet)
- Use the voting buttons on Youtube or Reddit (Only visible if the exension finds some wallet address in the content)
- Check user pics on your preferred chain https://www.caleidoscode.io/?chain=10200&p=1 (10200 Chiado, 534351 Scroll Sepolia, 245022926 Neon Devnet)
- Add your prefered chain wallet address to your content on Youtube or Reddit
- Use the extension to donate some funds
- Use the voting buttons on Youtube or Reddit
- Receive your share

| Chain | People's Pics Aggregator  |
| --- | --- |
| Gnosis Chiado | [People's Pics for Gnosis](https://www.caleidoscode.io/?chain=10200&p=1) |
| Scroll Sepolia | [People's Pics for Scroll](https://www.caleidoscode.io/?chain=534351&p=1)|
| Neon Devnet | [People's Pics for Neon](https://www.caleidoscode.io/?chain=245022926&p=1) |
| Our Testnet | [People's Pics for Testnet](https://www.caleidoscode.io/?chain=501984&p=1) |

# What are the constraints
- Donations are distributed over the choosen months starting with the next month
- Votes are accumulated within a month
- The share can only received for past months and only once.

# Open Topics
- Many....
- DAO
- Automatic Payout Mechanism: We're exploring options for efficient and fair payout mechanisms, aiming to avoid censorship by large companies.
- An API for the extension was suggested and should be discussed.
- We are still discussing Tokenomics, a way to distribute fragmental units of the donation pool back to users as a "thank you" for participation, this can be done because we can only use funds that are distributable on the amount of predefined fragments (months), so there can be some leftover that can be utilized for that and also for DAU actions.
- We are considering handing out Tokens or NFTs based on user and creator distributions which can be utilized in future tokenomics as an incentive.

# Join the Revolution!
Our project seeks to break the chains of advertiser-driven social media content and bring back true freedom of expression. By decentralizing the voting process, we aim to create a more community-driven and tailored social media experience. Join us in reshaping the future of social media and supporting free speech! 🚀🌐
