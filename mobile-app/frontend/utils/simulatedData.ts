import uuid from "react-native-uuid";

// Simulated AI verification
export const generateAIVerification = (income: string) => {
  const incomeNum = parseInt(income) || 0;
  const confidence = Math.floor(Math.random() * 15) + 85; // 85-100%

  let incomeStatus = "No conflict detected";
  let conflictDetected = false;

  // Randomly simulate conflicts for demo
  if (Math.random() > 0.8) {
    incomeStatus = "Minor discrepancy detected, flagged for review";
    conflictDetected = true;
  }

  return {
    incomeStatus,
    confidence,
    conflictDetected,
    timestamp: new Date().toISOString(),
  };
};

// Simulated blockchain receipt
export const generateBlockchainReceipt = () => {
  const hash = `0x${uuid.v4().toString().replace(/-/g, "")}`;

  return {
    transactionHash: hash,
    timestamp: new Date().toISOString(),
    status: "Anchored" as const,
    blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
    gasUsed: (Math.random() * 0.001 + 0.0001).toFixed(6),
  };
};

// Simulated OCR result
export const generateOCRResult = () => {
  const firstNames = [
    "Rajesh",
    "Priya",
    "Amit",
    "Sunita",
    "Vikram",
    "Anjali",
    "Ravi",
    "Meera",
  ];
  const lastNames = [
    "Kumar",
    "Sharma",
    "Patel",
    "Singh",
    "Reddy",
    "Nair",
    "Gupta",
    "Iyer",
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return {
    name: `Saatvik Goyal`,
    age: "15",
    sex: `male`,
  };
};

// Caste categories for dropdown
export const casteCategories = [
  "General",
  "OBC (Other Backward Class)",
  "SC (Scheduled Caste)",
  "ST (Scheduled Tribe)",
  "EWS (Economically Weaker Section)",
  "Prefer not to say",
];
