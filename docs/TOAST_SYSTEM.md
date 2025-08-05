# ROSCA Toast System Documentation

## Overview

The Jenga app uses a custom toast notification system specifically designed for ROSCA (Rotating Savings and Credit Association) and Chama applications. The system provides contextual, Bitcoin-themed notifications with appropriate icons and colors for different financial and social interactions.

## Features

- **8 specialized toast variants** with Bitcoin/financial theming
- **Contextual icons** for each notification type
- **Predefined functions** for common ROSCA operations
- **Consistent styling** matching the app's orange/Bitcoin color scheme
- **Enhanced accessibility** with proper contrast and screen reader support

## Toast Variants

### 1. Contribution (`contribution`)
- **Color**: Green with Bitcoin icon
- **Use**: Successful contribution to a group
- **Example**: "Contribution Successful! 🎉"

### 2. Payout (`payout`)
- **Color**: Emerald with Coins icon
- **Use**: Received payout from a group
- **Example**: "Payout Received! 💰"

### 3. Group Created (`groupCreated`)
- **Color**: Orange with Users icon
- **Use**: Successfully created a new ROSCA group
- **Example**: "Group Created Successfully! 🚀"

### 4. Member Joined (`memberJoined`)
- **Color**: Blue with UserPlus icon
- **Use**: New member joins a group
- **Example**: "New Member Joined! 👋"

### 5. Warning (`warning`)
- **Color**: Yellow with AlertTriangle icon
- **Use**: Important notices, risks, or reminders
- **Example**: "Contribution Due Soon! ⏰"

### 6. Pending (`pending`)
- **Color**: Light blue with Clock icon
- **Use**: Blockchain transactions in progress
- **Example**: "Transaction Pending ⏳"

### 7. Success (`success`)
- **Color**: Green with CheckCircle icon
- **Use**: General success messages
- **Example**: "Profile Updated Successfully!"

### 8. Error (`destructive`)
- **Color**: Red with X icon
- **Use**: Error messages and failures
- **Example**: "Transaction Failed"

## Usage

### Import the Hook

```typescript
import { useRoscaToast } from "@/hooks/use-rosca-toast";
```

### Basic Usage

```typescript
function MyComponent() {
  const { contributionSuccess, error, warning } = useRoscaToast();

  const handleContribution = async () => {
    try {
      // ... contribution logic
      contributionSuccess("0.001", "Family Savings Group");
    } catch (err) {
      error("Contribution Failed", "Please try again later");
    }
  };

  return (
    <button onClick={handleContribution}>
      Contribute
    </button>
  );
}
```

## Available Functions

### Financial Operations

#### `contributionSuccess(amount: string, groupName?: string)`
Shows success toast for completed contributions.
```typescript
contributionSuccess("0.001", "Family Group");
// "Contribution Successful! 🎉"
// "You contributed 0.001 cBTC to Family Group"
```

#### `payoutReceived(amount: string, groupName?: string)`
Shows success toast for received payouts.
```typescript
payoutReceived("0.012", "Friends Circle");
// "Payout Received! 💰"
// "You received 0.012 cBTC from Friends Circle"
```

#### `transactionPending(action: string)`
Shows pending toast for blockchain transactions.
```typescript
transactionPending("contribution");
// "Transaction Pending ⏳"
// "Your contribution is being processed on the blockchain"
```

### Group Management

#### `groupCreated(groupName: string, memberCount?: number)`
Shows success toast for new group creation.
```typescript
groupCreated("Savings Circle", 5);
// "Group Created Successfully! 🚀"
// "Savings Circle is ready with 5 members"
```

#### `memberJoined(memberName: string, groupName?: string)`
Shows notification when new member joins.
```typescript
memberJoined("Alice", "Family Group");
// "New Member Joined! 👋"
// "Alice joined Family Group"
```

#### `roundCompleted(roundNumber: number, groupName?: string)`
Shows notification when a round completes.
```typescript
roundCompleted(3, "Monthly Savers");
// "Round Completed! 🎯"
// "Round 3 of Monthly Savers has been completed successfully"
```

### General Notifications

#### `welcome(userName: string)`
Shows welcome message for new users.
```typescript
welcome("John");
// "Welcome to Jenga, John! 🎉"
// "Start your Bitcoin savings journey with trusted friends"
```

#### `success(title: string, description?: string)`
Shows general success message.
```typescript
success("Profile Updated", "Your changes have been saved");
```

#### `error(title: string, description?: string)`
Shows error message.
```typescript
error("Connection Failed", "Please check your internet connection");
```

#### `warning(title: string, description: string)`
Shows warning message.
```typescript
warning("Low Balance", "Your wallet balance is running low");
```

### Reminders

#### `contributionReminder(daysLeft: number, amount: string)`
Shows reminder for upcoming contributions.
```typescript
contributionReminder(2, "0.001");
// "Contribution Due Soon! ⏰"
// "0.001 cBTC contribution due in 2 days"
```

## Best Practices

### 1. Use Appropriate Variants
Choose the toast variant that best matches the user action:
- Financial operations → `contribution`, `payout`
- Group management → `groupCreated`, `memberJoined`
- Warnings/Reminders → `warning`
- Errors → `error`

### 2. Provide Context
Include relevant details like amounts, group names, and member names:
```typescript
// Good
contributionSuccess("0.001", "Family Savings");

// Less helpful
success("Success!");
```

### 3. Handle Async Operations
Use pending toasts for blockchain transactions:
```typescript
const handleContribute = async () => {
  const pendingToast = transactionPending("contribution");
  
  try {
    await contributeToGroup();
    pendingToast.dismiss();
    contributionSuccess(amount, groupName);
  } catch (error) {
    pendingToast.dismiss();
    error("Contribution Failed", error.message);
  }
};
```

### 4. Toast Timing
- Success messages: Auto-dismiss after 5 seconds
- Errors: Require manual dismissal
- Warnings: Auto-dismiss after 8 seconds
- Pending: Dismiss programmatically when resolved

## Customization

### Adding New Toast Types
To add a new toast variant:

1. Add the variant to `toastVariants` in `toast.tsx`:
```typescript
newVariant: "group border-purple-500 bg-purple-500 text-white shadow-purple-500/20",
```

2. Add the icon to `toastIcons`:
```typescript
newVariant: NewIcon,
```

3. Add helper function to `use-rosca-toast.ts`:
```typescript
const newVariantToast = (message: string) => {
  return toast({
    variant: "newVariant",
    title: "New Action!",
    description: message,
  });
};
```

### Styling Customization
Toast styles are defined in `src/components/ui/toast.tsx`. Each variant includes:
- Border color
- Background color
- Text color
- Shadow color with opacity

## Accessibility

The toast system includes:
- **Screen reader support** with proper ARIA labels
- **High contrast** colors for visibility
- **Keyboard navigation** support
- **Focus management** for interactive elements

## Examples in Context

### Dashboard Component
```typescript
function Dashboard() {
  const { contributionReminder, memberJoined } = useRoscaToast();

  useEffect(() => {
    // Check for upcoming contributions
    if (contributionDueSoon) {
      contributionReminder(daysLeft, amount);
    }

    // Listen for new members
    socket.on('memberJoined', (data) => {
      memberJoined(data.memberName, data.groupName);
    });
  }, []);
}
```

### Group Creation Form
```typescript
function CreateGroupForm() {
  const { groupCreated, error, transactionPending } = useRoscaToast();

  const handleSubmit = async (formData) => {
    const pendingToast = transactionPending("group creation");
    
    try {
      const result = await createGroup(formData);
      pendingToast.dismiss();
      groupCreated(formData.name, formData.maxMembers);
    } catch (err) {
      pendingToast.dismiss();
      error("Group Creation Failed", err.message);
    }
  };
}
```

This toast system provides a consistent, contextual, and visually appealing way to communicate with users throughout their ROSCA/Chama experience.
