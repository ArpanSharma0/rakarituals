import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-primary-background flex items-center justify-center">
      
      {/* 1. Background Layer: Tree */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative w-[120%] h-[120%] flex items-center justify-center">
          <Image 
            src="/images/tree.png" 
            alt="Tree Background" 
            fill 
            className="object-contain opacity-30 mix-blend-multiply" 
            priority
          />
        </div>
      </div>

      {/* 2. Mid Layer: Buddha */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl h-[60%] pointer-events-none z-10">
        <Image 
          src="/images/buddha.png" 
          alt="Buddha" 
          fill 
          className="object-contain object-bottom" 
          priority
        />
      </div>

      {/* 3. Foreground Layer: Water / Rocks */}
      <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-20">
        <Image 
          src="/images/water.png" 
          alt="Water foreground" 
          fill 
          className="object-cover object-bottom" 
          priority
        />
      </div>

      {/* 4. Text Overlay: Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pt-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase mb-4 text-center">
          RAKARITUALS
        </h1>
        <p className="text-lg md:text-xl font-medium tracking-widest uppercase mb-8 border border-text px-6 py-2 inline-block text-center">
          Meditate and Grow
        </p>
        <button className="px-8 py-3 bg-text text-primary-background font-semibold uppercase tracking-wider hover:bg-opacity-90 transition-all">
          Explore Collection
        </button>
      </div>
      
    </section>
  );
}
