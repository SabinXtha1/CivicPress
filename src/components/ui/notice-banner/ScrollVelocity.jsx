'use client';
import { useState } from "react";
import { Star } from "lucide-react";

import "./ScrollVelocity.css";

const technologies = [
  {
    name:"Sabin"
  },{
    name:"Hero"
  }
  // { name: "Next.js", icon: <SiNextdotjs /> },
  // { name: "HTML", icon: <SiHtml5 className="text-orange-500" /> },
  // { name: "CSS", icon: <SiCss3 className="text-blue-500" /> },
  // { name: "Git", icon: <SiGit className="text-red-500" /> },
  // { name: "MongoDB", icon: <SiMongodb className="text-green-500" /> },
  // { name: "Prisma", icon: <SiPrisma className="text-gray-500" /> },
  // {
  //   name:"Node Js",icon:<SiNodedotjs className="text-green-500"/>
  // },{
  //   name:'React JS',icon:<SiReact className="text-sky-400"/>
  // },
  // { name: "Mongoose", icon: <SiMongoose className="text-red-600" /> },{
  //   name:"Tailwind Css",icon:<SiTailwindcss className="text-blue-300"/>
  // }
];

function NewsAlert({
  direction = "horizontal",
  pauseOnHover = false,
  size = "clamp(8rem, 1rem + 30vmin, 25rem)",
  duration = "60s",
  textColor = "#ffffff",
  bgColor = "#FF0000",
  bgAccentColor = "#111111",
  data
}) {
  const [isPaused, setIsPaused] = useState(false);

  const wrapperClass = `logoWall-wrapper  ${direction === "vertical" ? "wrapper--vertical" : ""}`;
  const marqueeClass = `marquee ${direction === "vertical" ? "marquee--vertical" : ""} ${isPaused ? "paused" : ""}`;

  return (
    <article
      className={wrapperClass}
      style={{
        "--size": size,
        "--duration": duration,
        "--color-text": textColor,
        "--color-bg": bgColor,
        "--color-bg-accent": bgAccentColor,
      }}
    >
      <div
        className={marqueeClass}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        {[...Array(2)].map((_, index) => (
          <div key={index} className="marquee__group " aria-hidden={index === 1}>
            {data.map((name,index) => (
              <div key={index} className="flex gap-2 justify-center items-center font-silkscreen">
            
                <span className="text-xl text-white font-bold flex items-center gap-2">
                  {/* {icon} */}
                   {name} |
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}

export default NewsAlert;