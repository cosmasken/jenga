# Join Chama Modal Flow Documentation

## Overview
The Join Chama Modal follows a three-step process similar to the Create Chama Modal, providing a seamless user experience for joining existing ROSCA groups on the blockchain.

## Modal Structure

### Step 1: Group Details
- Display fetched group information
- Show group status (active/closed/full)
- Display contribution requirements
- Show member count and capacity
- Check and display user's balance
- Validate if user can join (balance check, group status)

### Step 2: Preview & Confirmation
- Review participation details
- Show expected commitment
- Display security deposit information
- Show total expected payout
- Highlight user responsibilities

### Step 3: Transaction Processing
- Submit join transaction to blockchain
- Show loading state with spinner
- Display transaction status
- Handle success/error cases
- Award achievements and log activity

## Data Flow

1. **Initial Data Loading**
   - Receive group ID from parent component
   - Use pre-fetched blockchain data if available
   - Fall back to fetching if no initial data

2. **Balance Validation**
   - Check user's cBTC balance
   - Calculate max spendable (balance - gas)
   - Validate against contribution requirement

3. **Membership Check**
   - Verify user is not already a member
   - Check group is accepting new members
   - Validate group is not full

4. **Transaction Submission**
   - Convert group ID to number for blockchain
   - Send joinGroup transaction with contribution
   - Wait for confirmation
   - Handle success/failure

## UI Components

### Header
- Dynamic title based on current step
- Subtitle with contextual information
- Bitcoin logo/branding

### Step Indicator
- Visual progress indicator
- Three numbered steps
- Active step highlighting

### Content Areas
- Form/details section
- Preview summary cards
- Transaction status display

### Action Buttons
- Cancel/Back navigation
- Continue/Confirm progression
- Disabled states based on validation

## Error Handling

- Network errors
- Insufficient balance
- Group full/closed
- Already a member
- Transaction failures

## Success Actions

1. Show success toast
2. Log activity to database
3. Award achievements
4. Create notification
5. Trigger parent callback
6. Close modal after delay

## Styling Consistency

- Bitcoin orange theme colors
- Dark mode support
- Consistent spacing (p-6, gap-4)
- Rounded corners (rounded-lg, rounded-xl)
- Shadow effects for depth
- Hover states for interactivity
