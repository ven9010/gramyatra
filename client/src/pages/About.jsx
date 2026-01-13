import aboutImg from "../assets/images/about_img.png";

const About = () => {
  return (
    <div className="w-full flex justify-center py-10">
      <div className="w-[90%] max-w-3xl rounded-xl shadow-2xl p-6 flex flex-col gap-5 bg-white">
        
        {/* Header */}
        <h1 className="text-4xl text-center font-bold text-slate-800">About Gramyatra</h1>

        {/* Branding Block */}
        <div className="flex flex-col items-center mx-auto">
          <img 
            src={aboutImg} 
            className="w-40 h-40 object-cover rounded-full shadow-md" 
            alt="Gramyatra" 
          />
          <h1 className="text-xl font-bold text-center mt-4 text-slate-700">
            India’s Village-First Travel Network 🇮🇳
          </h1>
        </div>

        {/* Mission Text */}
        <div className="flex flex-col gap-4 text-slate-700">
          <p className="text-lg leading-relaxed text-justify">
            Gramyatra is a Swadeshi travel platform built to connect travelers directly
            with India’s villages, homestays, and local guides. Unlike traditional
            tourism platforms that funnel money into large corporations, Gramyatra
            ensures every booking benefits rural communities, farmers, and local
            families.
          </p>

          <p className="text-lg leading-relaxed text-justify">
            Each stay on Gramyatra is more than a trip — it is an economic contribution.
            Your payment is split transparently between homestays, village guides,
            local food producers, and a community fund that supports village
            development.
          </p>

          <p className="text-lg leading-relaxed text-justify">
            Our mission is simple: build a travel ecosystem where India explores India,
            while strengthening the people who keep its culture alive.
          </p>
        </div>

        {/* Slogan Badge */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-700 text-center shadow-sm">
          <p className="font-bold text-green-800 text-lg">
            🌱 Travel that grows villages, not corporations.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;
