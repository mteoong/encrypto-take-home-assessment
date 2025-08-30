## To Run

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Chosen Post-Mutation Approach

I chose router.refresh() because it was much simpler to implement, and I was running out of time. Also for this few API calls Cache invalidation was unecessary and too complex. 

## What I would do with another day
1. Fix the toast to show success 
2. Write the tests
3. Go through the code and optimize
4. Reorder the code to improve logic
5. Implement pay now feature so that if the user wants to make a quick payment, it would avalanche if possible, or pay required loans first. 