const user = process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN

if (user === 'dependabot[bot]') {
  console.log('Skipping Vercel build for Dependabot PR')
  process.exit(0) // Tells Vercel to skip
}

process.exit(1) // Tells Vercel to proceed
