export function Navbar() {  

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-2 flex justify-between items-center shadow-sm">
      <div 
        className="text-xl font-bold text-slate-800 cursor-pointer flex items-center gap-2"
        onClick={() => {  }} 
      >
      <img  src="/市集小幫手.jpg"  alt="市集小幫手 LOGO" 
            style={{ width: '100px', height: 'auto' }} />
      </div>
    </nav>
  );
}