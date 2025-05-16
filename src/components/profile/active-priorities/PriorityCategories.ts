
import { PriorityCategory } from '@/lib/supabase/profiles/types';

// Define priority categories with activities
const PRIORITY_CATEGORIES: PriorityCategory[] = [
  {
    name: "Parenting Activities",
    activities: ["Finding playdate partners", "Discovering family-friendly venues", "Organizing children's activities", "Seeking parent support groups"]
  },
  {
    name: "Fitness Goals",
    activities: ["Training for a 5K", "Finding a tennis partner", "Looking for yoga buddies", "Starting group workouts", "Seeking hiking companions"]
  },
  {
    name: "Local Exploration",
    activities: ["Checking out new cafés", "Finding hidden dining spots", "Exploring weekend markets", "Discovering local art galleries"]
  },
  {
    name: "Creative Pursuits",
    activities: ["Working on writing projects", "Starting painting/drawing", "Learning photography", "Making music", "Craft workshops"]
  },
  {
    name: "Professional Growth",
    activities: ["Building a startup", "Looking for co-working partners", "Seeking mentorship", "Skill exchange", "Networking in my industry"]
  },
  {
    name: "Social Activities",
    activities: ["Forming a game group", "Starting a book club", "Organizing team sports", "Planning community events"]
  }
];

export default PRIORITY_CATEGORIES;
