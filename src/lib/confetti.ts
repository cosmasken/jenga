// Simple confetti animation using CSS and DOM manipulation
export default function confetti() {
  const colors = ['#F7931A', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];
  
  for (let i = 0; i < 50; i++) {
    createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
  }
}

function createConfettiPiece(color: string) {
  const confetti = document.createElement('div');
  confetti.style.position = 'fixed';
  confetti.style.width = '10px';
  confetti.style.height = '10px';
  confetti.style.backgroundColor = color;
  confetti.style.left = Math.random() * 100 + 'vw';
  confetti.style.top = '-10px';
  confetti.style.zIndex = '1000';
  confetti.style.borderRadius = '50%';
  confetti.style.pointerEvents = 'none';
  
  document.body.appendChild(confetti);
  
  const animationDuration = Math.random() * 2000 + 1000; // 1-3 seconds
  const horizontalMovement = (Math.random() - 0.5) * 200; // -100 to 100px
  
  confetti.animate([
    {
      transform: 'translateY(0px) translateX(0px) rotate(0deg)',
      opacity: 1
    },
    {
      transform: `translateY(100vh) translateX(${horizontalMovement}px) rotate(360deg)`,
      opacity: 0
    }
  ], {
    duration: animationDuration,
    easing: 'ease-out'
  }).finished.then(() => {
    confetti.remove();
  });
}
