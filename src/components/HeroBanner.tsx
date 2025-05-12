import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const banners = [
  {
    id: 1,
    image: "/images/banner.png",
    title: "Os maiores sucessos do streaming",
    description: "Assista La Casa de Papel e muito mais pelo melhor preço de Angola",
    link: "/gift-card/netflix"
  },
  {
    id: 2,
    image: "/images/banner2.png",
    title: "Assista a todos os jogos ao vivo",
    description: "Com o TVExpress, você acompanha todas as ligas ao vivo pelo melhor preço de Angola",
    link: "/gift-card/tvexpress"
  }
];

const HeroBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Banner Desktop */}
    <div className="relative overflow-hidden h-[500px] hidden md:block">
      <div className="absolute inset-0">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <img 
              src={banner.image}
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dot-brand-blue/90 to-transparent" />
          </div>
        ))}
      </div>

      <div className="relative h-full flex items-center">
        <div className="px-6 max-w-6xl mx-auto w-full">
          <div className="max-w-lg">
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight transition-all duration-500 transform"
              style={{
                opacity: 1,
                transform: "translateY(0)"
              }}
            >
              {banners[currentBanner].title.split(' ').map((word, i) => (
                <span key={i} className="inline-block mr-2">{word}</span>
              ))}
            </h1>
            
            <p 
              className="text-lg md:text-xl text-white/90 mb-8 transition-all duration-500 delay-200"
              style={{
                opacity: 1,
                transform: "translateY(0)"
              }}
            >
              {banners[currentBanner].description}
            </p>

            <Link to={banners[currentBanner].link}>
              <Button 
                className="bg-white text-dot-brand-blue hover:bg-white/90 transition-all duration-300 group px-6 py-6 text-lg"
              >
                Explorar Agora
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentBanner 
                ? "bg-white w-8" 
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>

      {/* Banner Mobile - semelhante ao desktop, otimizado */}
      <div className="relative overflow-hidden h-56 xs:h-64 sm:h-72 w-full md:hidden">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img 
              src={banner.image}
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dot-brand-blue/90 via-dot-brand-blue/60 to-transparent" />
          </div>
        ))}
        <div className="absolute inset-0 flex flex-col justify-center items-start px-4 z-20">
          <h1 className="text-white text-xl xs:text-2xl font-bold drop-shadow-lg mb-2 leading-tight max-w-[90%]">
            {banners[currentBanner].title}
          </h1>
          <p className="text-white/90 text-sm xs:text-base mb-3 drop-shadow max-w-[90%]">
            {banners[currentBanner].description}
          </p>
          <Link to={banners[currentBanner].link} className="flex justify-start">
            <Button className="w-auto bg-white text-dot-brand-blue font-semibold text-xs px-4 h-9 rounded-lg shadow flex items-center gap-1 min-h-0">
              Explorar Agora <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-30">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`h-1.5 w-5 rounded-full transition-all duration-300 mx-0.5 ${
                index === currentBanner 
                  ? "bg-white/90" 
                  : "bg-white/40"
              }`}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HeroBanner;
