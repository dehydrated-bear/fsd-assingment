import './App.css'
import image from "./assets/image.jpeg";

function App() {
  return (
    <div className="portfolio">

      <header className="header">
        <h1>Harshit</h1>

        <nav>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero box">
        <div>
          <p>Hello, I'm</p>
          <h2>Harshit</h2>
          <p>Computer Science Student & Developer</p>

          <button>View My Work</button>
        </div>

        <div className="profile-box">
          <p> <img src={image} alt="Me" /></p>
        </div>
      </section>

      <section id="about" className="box">
        <h2>About Me</h2>

        <p>
          I am a student interested in programming, web development,
          and building interesting projects.
        </p>
      </section>

      <section id="skills" className="box">
        <h2>Skills</h2>

        <div className="cards">
          <div className="card">
            <h3>C++</h3>
            <p>Programming</p>
          </div>

          <div className="card">
            <h3>React</h3>
            <p>Frontend Development</p>
          </div>

          <div className="card">
            <h3>JavaScript</h3>
            <p>Web Development</p>
          </div>
        </div>
      </section>

      <section id="projects" className="box">
        <h2>Projects</h2>

        <div className="cards">
          <div className="card">
            <h3>Project One</h3>
            <p>A short description of my project.</p>
            <button>View Project</button>
          </div>

          <div className="card">
            <h3>Project Two</h3>
            <p>A short description of my project.</p>
            <button>View Project</button>
          </div>

          <div className="card">
            <h3>Project Three</h3>
            <p>A short description of my project.</p>
            <button>View Project</button>
          </div>
        </div>
      </section>

      <section id="contact" className="box">
        <h2>Contact Me</h2>

        <p>Email: harsihit@email.com</p>
        <p>GitHub: github.com/harshit</p>
        <p>LinkedIn: linkedin.com/in/hashit</p>
      </section>

      <footer>
        <p>portfolio Harshit</p>
      </footer>

    </div>
  )
}

export default App