// Replace this sample profile and original demo content with your own details.
export const profile = {
  name: 'Harshit',
  location: 'India',
  timezone: 'Asia/Kolkata',
  timezoneLabel: 'IST',
}

// Swap these original illustrated placeholders for your own /public/ photos.
// Keep titles short and notes around 100 characters so the printed page fits.
export const keepsakes = [
  {
    id: 'long-way',
    label: 'A change of pace',
    title: 'The longer way home.',
    image: '/keepsakes/long-way.svg',
    alt: 'Illustrated placeholder of a winding path through green mountains',
    note: 'A little distance from the screen. A little more room to notice what is already there.',
  },
  {
    id: 'slow-morning',
    label: 'The quiet bits',
    title: 'Before the day begins.',
    image: '/keepsakes/slow-morning.svg',
    alt: 'Illustrated placeholder of a cup and a plant beside a sunlit window',
    note: 'A warm cup, an open window, and a few minutes with nothing to catch up on.',
  },
  {
    id: 'first-draft',
    label: 'Always a first draft',
    title: 'It starts on paper.',
    image: '/keepsakes/first-draft.svg',
    alt: 'Illustrated placeholder of a pencil and a notebook with a rough interface sketch',
    note: 'Messy sketches before tidy pixels. Keeping a reminder that a first attempt is enough to begin.',
  },
]

export const projects = [
  {
    id: 'margin',
    name: 'Margin',
    type: 'A place to think',
    year: '2026',
    kind: 'notes',
    description:
      'A quieter home for scattered thoughts. A notebook concept that makes room for the idea, not the interface.',
    stack: ['React', 'Node.js', 'MongoDB'],
    detail:
      'Margin is a sample project concept for this portfolio. The idea is a distraction-free notebook with searchable notes and simple collections. Replace this entry with a real project, its screenshots, and a link when you are ready.',
  },
  {
    id: 'interval',
    name: 'Interval',
    type: 'Make room for focus',
    year: '2026',
    kind: 'timer',
    description:
      'One task, a little time, and fewer distractions. A small focus timer for a more intentional working day.',
    stack: ['React', 'CSS', 'Web Audio'],
    detail:
      'Interval is an interactive portfolio demo. Try the focus timer on the project card: start, pause, and reset it. A full version could add session history and configurable durations. This concept is not presented as a shipped product.',
  },
]

export const articles = [
  {
    slug: 'less-interface',
    title: 'The best feature might be one less thing.',
    category: 'Design notes',
    date: '2026-10-12',
    readTime: '3 min',
    paragraphs: [
      'An empty screen can feel unfinished. That feeling makes it tempting to add another panel, another metric, or another shortcut. But a useful interface is not a collection of everything it could do. It is a clear path to what someone needs right now.',
      'On a recent small experiment, I started by listing every possible control. Then I tried the opposite: one input and one action. The second version was easier to explain, easier to navigate with a keyboard, and much harder to misunderstand.',
      'Removing something is not automatically good design. The question is whether the person still has what they need. I am learning to test that question before adding more.',
    ],
  },
  {
    slug: 'learning-in-public',
    title: 'Small projects, real lessons.',
    category: 'Building',
    date: '2026-09-24',
    readTime: '2 min',
    paragraphs: [
      'A small project offers something a tutorial cannot: a collection of decisions that belong to you. What should happen when the list is empty? What does an error say? Can the button be reached without a mouse?',
      'These questions rarely appear in the first sketch. They show up when a real person tries the thing. That is why I like finishing a tiny tool before planning a much larger one.',
      'This portfolio is part of that practice. The work is not finished forever; it is simply ready for the next useful piece of feedback.',
    ],
  },
  {
    slug: 'details-that-care',
    title: 'A little care in the in-between states.',
    category: 'Development',
    date: '2026-09-08',
    readTime: '3 min',
    paragraphs: [
      'Loading, empty, and error states are often treated as the edges of an interface. For someone on a slow connection, they can be most of the experience.',
      'I try to make those moments specific. A loading message should explain what is on its way. An empty state should suggest a useful next step. An error should be honest about what happened, without blaming the person reading it.',
      'These details are not decorative polish. They are the parts that help someone keep going when the ideal path stops being ideal.',
    ],
  },
]
