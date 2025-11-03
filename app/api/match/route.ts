import { type NextRequest, NextResponse } from "next/server"

interface FormData {
  year: string
  branch: string
  strongSubjects: string[]
  helpSubjects: string[]
  studyStyle: string
  groupSize: string
  timeSlots: string
  sessionPreference: string
  location: string
  branchPreference: string
}

interface MatchResult {
  name: string
  similarity: number
  commonSubjects: string[]
  studyStyle: string
}

// Sample data for generating realistic matches
const SAMPLE_NAMES = [
  "Alex Chen",
  "Sarah Johnson",
  "Michael Rodriguez",
  "Emily Wang",
  "David Kim",
  "Jessica Brown",
  "Ryan Patel",
  "Amanda Davis",
  "Kevin Liu",
  "Rachel Green",
  "Jason Martinez",
  "Lisa Thompson",
  "Daniel Lee",
  "Maria Garcia",
  "Chris Wilson",
  "Anna Singh",
]

const STUDY_STYLES = ["Quiet", "Interactive", "Problem-solving", "Mixed"]

function generateMatches(formData: FormData): MatchResult[] {
  const matches: MatchResult[] = []

  // Generate 3-5 random matches
  const numMatches = Math.floor(Math.random() * 3) + 3
  const usedNames = new Set<string>()

  for (let i = 0; i < numMatches; i++) {
    let name: string
    do {
      name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)]
    } while (usedNames.has(name))
    usedNames.add(name)

    // Calculate similarity based on form data
    let similarity = Math.floor(Math.random() * 30) + 70 // Base similarity 70-100%

    // Determine common subjects (intersection of strong subjects and help subjects)
    const commonSubjects: string[] = []

    // Add some of the user's strong subjects as common subjects
    const strongSubjectsToAdd = Math.min(formData.strongSubjects.length, 3)
    for (let j = 0; j < strongSubjectsToAdd; j++) {
      if (Math.random() > 0.3) {
        // 70% chance to include each strong subject
        const subject = formData.strongSubjects[Math.floor(Math.random() * formData.strongSubjects.length)]
        if (!commonSubjects.includes(subject)) {
          commonSubjects.push(subject)
        }
      }
    }

    // Add some of the user's help subjects as common subjects
    const helpSubjectsToAdd = Math.min(formData.helpSubjects.length, 2)
    for (let j = 0; j < helpSubjectsToAdd; j++) {
      if (Math.random() > 0.4) {
        // 60% chance to include each help subject
        const subject = formData.helpSubjects[Math.floor(Math.random() * formData.helpSubjects.length)]
        if (!commonSubjects.includes(subject)) {
          commonSubjects.push(subject)
        }
      }
    }

    // Ensure at least one common subject
    if (commonSubjects.length === 0 && formData.strongSubjects.length > 0) {
      commonSubjects.push(formData.strongSubjects[0])
    }

    // Choose study style (prefer matching or complementary styles)
    let studyStyle: string
    if (Math.random() > 0.4) {
      // 60% chance to match the user's study style
      studyStyle = formData.studyStyle || STUDY_STYLES[Math.floor(Math.random() * STUDY_STYLES.length)]
    } else {
      // 40% chance for a different but complementary style
      studyStyle = STUDY_STYLES[Math.floor(Math.random() * STUDY_STYLES.length)]
    }

    // Adjust similarity based on matches
    if (studyStyle === formData.studyStyle) similarity += 5
    if (commonSubjects.length >= 3) similarity += 10
    if (commonSubjects.length >= 2) similarity += 5

    // Cap similarity at 98%
    similarity = Math.min(similarity, 98)

    matches.push({
      name,
      similarity,
      commonSubjects: commonSubjects.slice(0, 4), // Limit to 4 subjects for display
      studyStyle,
    })
  }

  // Sort matches by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity)

  return matches
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json()

    // Validate required fields
    if (!formData.year || !formData.branch) {
      return NextResponse.json({ error: "Year and branch are required fields" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate matches based on form data
    const matches = generateMatches(formData)

    return NextResponse.json({
      success: true,
      matches,
      message: `Found ${matches.length} potential study partners for you!`,
    })
  } catch (error) {
    console.error("Error processing match request:", error)
    return NextResponse.json({ error: "Failed to process your request. Please try again." }, { status: 500 })
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST to submit match requests." }, { status: 405 })
}
