# zkSalaryStream-Mock

A privacy-preserving salary streaming platform with mock Kotani Pay integration for demonstration purposes.

## 🌟 What is zkSalaryStream?

zkSalaryStream is a **privacy-preserving salary payment system** that allows employers to stream salaries to employees in real-time while maintaining confidentiality of salary amounts. It combines:

- **🔄 Real-time Streaming**: Salaries are paid continuously over time instead of lump sums
- **🔒 Zero-Knowledge Privacy**: Salary amounts remain private using ZK proofs
- **📱 Mobile Money Integration**: Direct payouts to mobile wallets via Kotani Pay
- **⛓️ Blockchain Transparency**: All transactions are recorded on-chain for auditability

### Why This Matters

**Traditional Problems:**
- Salaries are paid monthly/bi-weekly causing cash flow issues
- Salary amounts are visible to HR/payroll systems
- Limited payment options for global/remote workers
- High fees for cross-border payments

**zkSalaryStream Solutions:**
- **Continuous Cash Flow**: Employees can access earned wages anytime
- **Privacy Protection**: ZK proofs verify salary ranges without revealing exact amounts
- **Global Accessibility**: Mobile money integration for underbanked populations
- **Cost Effective**: Blockchain-based payments with lower fees

## 🎯 How It Works

### 1. **Employer Creates Stream**
```
Employer → Sets up salary stream for employee
         → Defines total amount and duration  
         → Generates ZK proof for salary range
         → Stream becomes active on blockchain
```

### 2. **Real-time Streaming** 
```
Time Passes → Salary accumulates continuously
            → Employee can withdraw available amount anytime
            → Rate: Total Amount ÷ Duration = Per-second rate
```

### 3. **Private Withdrawals**
```
Employee → Requests withdrawal 
         → Chooses mobile money payout
         → Receives funds in local currency
         → Transaction recorded on blockchain
```

### 4. **Zero-Knowledge Privacy**
```
ZK Proof → Proves salary is within acceptable range
         → Without revealing exact amount
         → Enables compliance without privacy loss
         → Verifiable by third parties
```

## 💡 Example Use Case

**Alice (Employer)** wants to pay **Bob (Employee)** 1 ETH over 30 days:

1. **Stream Creation**: Alice creates a stream for 1 ETH over 2,592,000 seconds (30 days)
2. **Streaming Rate**: Bob earns ~0.000000386 ETH per second  
3. **Day 10 Withdrawal**: Bob can withdraw ~0.333 ETH (10 days worth)
4. **Mobile Payout**: Bob receives equivalent KES in his mobile wallet
5. **Privacy**: Everyone can see a transaction occurred, but not the amount
6. **Compliance**: ZK proof shows Bob's salary is within company range (e.g., 0.5-2 ETH/month)

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Dashboard (React + Vite)               │
│           Stream Creation │ Withdrawals │ Payouts       │
└─────────────────────┬───────────────────────────────────┘
                      │ REST + GraphQL API
┌─────────────────────┴───────────────────────────────────┐
│                   Backend (NestJS)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Streams    │ │    ZK       │ │   MockKotani        ││
│  │  Module     │ │  Module     │ │   Service           ││
│  │• Create     │ │• Generate   │ │• FX Quotes          ││
│  │• Withdraw   │ │• Verify     │ │• Mobile Payouts     ││
│  │• Monitor    │ │• Validate   │ │• Status Tracking    ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────┬───────────────────────────────────┘
                      │ Contract Interactions
┌─────────────────────┴───────────────────────────────────┐
│            Smart Contracts (Hardhat Local)             │
│                    SalaryStream.sol                     │
│               • Stream Management                       │
│               • Withdrawal Logic                        │
│               • Event Emissions                         │
└─────────────────────────────────────────────────────────┘
```

## 🗂 Repository Structure

```
.
├── contracts/                 # Smart contracts
│   ├── SalaryStream.sol      # Main streaming contract
│   ├── test/                 # Contract tests
│   └── scripts/              # Deployment scripts
├── circuit/                  # Zero-knowledge circuits
│   ├── salaryRange.circom    # Range proof circuit
│   └── generateProof.ts      # Proof generation utilities
├── apps/
│   ├── backend/              # NestJS API server
│   │   ├── src/
│   │   │   ├── streams/      # Stream management
│   │   │   ├── zk/           # ZK proof validation
│   │   │   └── mock-kotani/  # Mock Kotani Pay service
│   │   └── test/
│   └── dashboard/            # React frontend
│       ├── src/
│       │   ├── components/   # Reusable components
│       │   ├── pages/        # Application pages
│       │   └── services/     # API integration
│       └── public/
├── .github/workflows/        # CI/CD pipelines
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Redis (for background jobs)

### One-Command Setup

```bash
# Clone and setup everything
git clone <repository-url>
cd zkSalaryStream
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zkSalaryStream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Redis** (required for background jobs)
   ```bash
   # On macOS with Homebrew:
   brew services start redis
   
   # Or using Docker:
   docker run -d -p 6379:6379 redis:7-alpine
   ```

4. **Start all services**
   ```bash
   # Terminal 1: Hardhat local blockchain
   npm run dev:hardhat
   
   # Terminal 2: Deploy contracts
   npm run deploy:contracts
   
   # Terminal 3: Backend API
   npm run dev:backend
   
   # Terminal 4: Frontend dashboard
   npm run dev:dashboard
   ```

### Access the Application

- **🎨 Dashboard**: http://localhost:3000
- **🔧 Backend API**: http://localhost:4000  
- **📊 GraphQL Playground**: http://localhost:4000/graphql
- **⛓️ Hardhat Network**: http://localhost:8545

## 🎮 Try It Out

### 1. Create a Stream
1. Go to http://localhost:3000/create
2. Enter recipient address: `0xc0ffee254729296a45a3885639AC7E10F9d54979`
3. Set amount: `1.0 ETH`
4. Choose duration: `1 Day` 
5. Click "Create Stream"

### 2. View Streams
1. Go to http://localhost:3000/streams
2. See your active stream with real-time balance
3. Click "Withdraw" to test payout

### 3. Test Mobile Payouts
1. Go to http://localhost:3000/cashout
2. Enter phone: `+254700000007` (ends in 7 = success)
3. Select currency: `KES`
4. Enter amount: `1000`
5. Click "Create Payout"

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Individual Test Suites
```bash
# Smart contract tests (with coverage)
npm run test:contracts

# Backend unit tests  
npm run test:backend

# End-to-end tests
npm run test:e2e
```

### Key Test Scenarios
- ✅ Stream creation with ZK proof generation
- ✅ Real-time balance calculations
- ✅ Withdrawal processing 
- ✅ MockKotani payout simulation
- ✅ Error handling and edge cases

## 📦 Mock Kotani Pay Integration

The `MockKotaniService` simulates the Kotani Pay API without requiring external credentials:

### Features
- **💱 Fake FX Quotes**: Returns mock exchange rates for ETH to African currencies
- **📱 Simulated Payouts**: Creates fake mobile money transactions
- **📊 Status Simulation**: Uses phone number patterns for different outcomes
- **🔄 No External Calls**: Everything runs in-memory for development

### Mock Payout Status Simulation
Phone number patterns determine payout outcomes:
- **Ending 0-7**: `DELIVERED` ✅ (success)
- **Ending 8**: `PENDING` ⏳ (processing) 
- **Ending 9**: `FAILED` ❌ (error)

**Example Testing Numbers:**
```bash
+254700000007  # Success
+254700000008  # Pending  
+254700000009  # Failed
```

## 🔄 Swapping to Real Kotani Pay

To replace the mock service with real Kotani Pay integration:

1. **Update Service Implementation**:
   ```typescript
   // apps/backend/src/mock-kotani/mock-kotani.service.ts
   // Replace mock methods with real Kotani Pay API calls
   ```

2. **Add Real Environment Variables**:
   ```bash
   KOTANI_API_KEY=your_real_api_key
   KOTANI_BASE_URL=https://api.kotanipay.com
   ```

3. **Update Frontend Configuration**:
   ```typescript
   // Remove mock status simulation logic
   // Add real error handling for API responses
   ```

## 🛠 Configuration

### Environment Variables

#### Backend (.env.local)
```bash
# Database (MongoDB Atlas - Already configured)
MONGODB_URI=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/

# Redis for background jobs
REDIS_HOST=localhost
REDIS_PORT=6379

# Ethereum blockchain
ETHEREUM_RPC_URL=http://localhost:8545

# Server config
PORT=4000
NODE_ENV=development
```

#### Frontend (.env.local)  
```bash
VITE_BACKEND_URL=http://localhost:4000
```

## 🔒 Security & Privacy

### Zero-Knowledge Proofs
- **Range Proofs**: Verify salary is within acceptable bounds
- **No Amount Disclosure**: Exact amounts remain private
- **Verifiable Compliance**: Third parties can verify without seeing data

### Smart Contract Security
- **Reentrancy Protection**: Safe withdrawal patterns
- **Access Controls**: Only authorized withdrawals
- **Event Logging**: Complete audit trail

### Data Protection
- **Minimal Data Storage**: Only necessary information persisted
- **Encryption**: Sensitive data encrypted at rest
- **Privacy by Design**: Default privacy-preserving architecture

## 🌍 Real-World Applications

### Use Cases
1. **💼 Remote Work**: Global salary payments with local currency conversion
2. **🏗️ Gig Economy**: Continuous earnings for freelancers  
3. **🏭 Payroll Privacy**: Confidential executive compensation
4. **🌍 Emerging Markets**: Banking the unbanked via mobile money
5. **📊 Compliance**: Regulatory reporting without privacy loss

### Benefits
- **👤 For Employees**: Better cash flow, privacy, global accessibility
- **🏢 For Employers**: Reduced HR overhead, global talent access, compliance  
- **🏛️ For Regulators**: Verifiable compliance without data access
- **🌐 For Society**: Financial inclusion, reduced banking fees

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`  
5. **Open** a Pull Request

### Development Guidelines
- Write tests for new features
- Follow TypeScript best practices
- Update documentation for changes
- Ensure all tests pass before PR

## 📚 Learn More

### Technical Deep Dives
- [Smart Contract Architecture](./contracts/README.md)
- [Zero-Knowledge Circuit Design](./circuit/README.md)  
- [Backend API Documentation](./apps/backend/README.md)
- [Frontend Architecture](./apps/dashboard/README.md)

### Research Papers
- [Privacy-Preserving Payroll Systems](https://example.com)
- [ZK-SNARKs for Financial Privacy](https://example.com)
- [Mobile Money Integration Patterns](https://example.com)

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

**🚀 Built for the future of private, global, real-time compensation**

Made with ❤️ for privacy-preserving DeFi 