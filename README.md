# 🔥 Memes as NFTs with Creator Royalties

> Where viral meme creators earn forever! 🚀

## 📋 Overview

Transform your hilarious memes into valuable NFTs and earn royalties every time they're resold. This smart contract platform empowers meme creators to monetize their viral content while maintaining ownership and earning passive income.

## ✨ Features

- 🎨 **Mint Memes as NFTs** - Turn your viral content into unique digital assets
- 💰 **Creator Royalties** - Earn up to 10% on every resale automatically
- 🛍️ **Marketplace** - Buy, sell, and discover trending memes
- ❤️ **Social Features** - Like memes and track viral scores
- 👤 **Creator Profiles** - Build your reputation and following
- 📊 **Analytics** - Track your meme performance and earnings
- 🔒 **Secure Ownership** - Immutable proof of creation and ownership

## 🛠️ Technology Stack

- **Smart Contract**: Clarity (Stacks blockchain)
- **Frontend**: HTML5, CSS3, JavaScript
- **Testing**: Clarinet framework
- **Wallet**: Compatible with Hiro Wallet & Xverse

## 🚀 Quick Start

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) installed
- [Node.js](https://nodejs.org/) (optional, for local development)

### Installation

1. Clone this repository
```bash
git clone https://github.com/your-username/memes-as-nfts-creator-royalties.git
cd memes-as-nfts-creator-royalties
```

2. Initialize Clarinet project
```bash
clarinet new meme-nft-project
cd meme-nft-project
```

3. Copy the contract files
```bash
cp ../contracts/Memes-as-NFts-For-Creators.clar contracts/
```

4. Run tests
```bash
clarinet test
```

5. Deploy locally
```bash
clarinet console
```

### 🌐 Running the Frontend

1. Open `index.html` in your web browser
2. Connect your Stacks wallet
3. Start minting and trading memes!

## 📖 Smart Contract Functions

### 🎯 Core Functions

#### `mint-meme`
Create a new meme NFT with royalty settings
```clarity
(mint-meme title description image-url royalty-percentage tags recipient)
```

#### `buy-meme`
Purchase a listed meme NFT (includes automatic royalty distribution)
```clarity
(buy-meme token-id)
```

#### `list-meme`
List your meme NFT for sale
```clarity
(list-meme token-id price)
```

#### `like-meme`
Like a meme to increase its viral score
```clarity
(like-meme token-id)
```

### 📊 Read-Only Functions

- `get-meme-data` - Get complete meme information
- `get-creator-stats` - View creator statistics
- `get-meme-likes` - See who liked a meme
- `get-ownership-history` - Track ownership transfers
- `get-total-memes` - Total memes minted

## 💡 How It Works

1. **🎨 Mint**: Create your meme NFT with custom royalty percentage (0-10%)
2. **💰 Sell**: List on the marketplace for others to discover
3. **📈 Earn**: Receive royalties automatically on every resale
4. **🔥 Go Viral**: Higher likes = higher viral score = more visibility

## 🎯 Royalty System

- Creators set royalty percentage (0-10%) when minting
- Automatic distribution on every sale:
  - 💰 Seller gets sale price minus fees
  - 🎨 Creator gets royalty percentage
  - 🏢 Platform gets 2.5% marketplace fee

## 🌟 UI Features

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Accessible navigation

### 🎨 Modern Interface
- Gradient backgrounds
- Smooth animations
- Card-based layout
- Modal dialogs

### 🔍 Search & Discovery
- Search by title, description, or tags
- Filter by viral score
- Browse trending memes

## 🧪 Testing

Run the test suite:
```bash
clarinet test
```

Test specific functions:
```bash
clarinet console
```

## 🔒 Security Features

- Input validation on all functions
- Ownership verification
- Reentrancy protection
- Maximum royalty limits
- Secure transfer mechanisms

## 📊 Data Structures

### Meme Data
- Title, description, image URL
- Creator address and timestamp
- Royalty percentage
- Viral score and tags

### Creator Stats
- Total memes created
- Total earnings from royalties
- Follower count

## 🎮 Demo Data

The frontend includes localStorage simulation for testing:
- Mint demo memes
- Simulate purchases
- Track likes and viral scores

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Stacks blockchain for the robust smart contract platform
- Clarinet team for the excellent development tools
- The meme community for endless inspiration

## 📞 Support

- 🐛 [Report Issues](https://github.com/your-username/memes-as-nfts-creator-royalties/issues)
- 💬 [Join Discord](https://discord.gg/your-server)
- 🐦 [Follow on Twitter](https://twitter.com/your-handle)

---

**Happy Meme-ing!** 🎉 Turn your viral moments into valuable NFTs and start earning royalties today!
