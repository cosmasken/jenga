
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useDarkMode } from './lib/useDarkMode';
import DynamicMethods from './components/Methods';
import "./App.css";
import { GreetingForm } from "./components/GreetingForm";

function App() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="modal">
        <DynamicWidget />
        <DynamicMethods isDarkMode={isDarkMode} />
        <GreetingForm />
      </div>
    </div>
  );
}

export default App;