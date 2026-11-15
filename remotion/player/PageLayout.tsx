import React from "react";
import {lessons} from "../src/lessons";
export function PageLayout({episode=0,onEpisodeChange,children}:{episode?:number;onEpisodeChange?:(episode:number)=>void;children:React.ReactNode}) {
  const lesson=lessons[episode]!;
  return (
    <main>
      <header className="page-header">
        <h1>易哈佛解剖课堂 <span lang="en">EHAFO Anatomy Classroom</span></h1>
      </header>
      <nav className="episode-tabs" aria-label="选择课程">
        {lessons.map((l, i) => (
          <button
            key={l.id}
            onClick={() => onEpisodeChange?.(i)}
            aria-pressed={i === episode}
            className={i === episode ? "episode-tab selected" : "episode-tab"}
          >
            {l.title}
          </button>
        ))}
      </nav>
      <section aria-label={lesson.title}>
        <div className="lesson-heading">
          <h2>{lesson.title}</h2>
          <p>{lesson.description}</p>
        </div>
        {children}
      </section>
      <footer>
        <p>© {new Date().getFullYear()} 易哈佛医疗 <a href="https://www.ehafo.com" target="_blank" rel="noreferrer">Ehafo.com</a></p>
      </footer>
    </main>
  );
}
