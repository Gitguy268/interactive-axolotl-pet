import { Axolotl } from "./components/Axolotl";

export function App() {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-transparent">
      {/* Optional demo background wrapper: keep Axo transparent; remove or style externally as needed. */}
      <div className="relative">
        <Axolotl className="hover:scale-[1.03] transition-transform duration-300" size={460} />
      </div>
    </div>
  );
}
