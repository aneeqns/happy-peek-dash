<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Creator data endpoints require a verified account with an immutable database role and a user-bound signed pass; browser roles only control presentation.
- Public demo AI and quotes use durable request quotas; AI also has a global spend budget, bounded JSON inputs, output tokens, and tool steps.
- Security dependency overrides keep patched transitive libraries without replacing the framework bootstrap.
- Chat accepts only bounded text history; chart tool parts remain local to prevent arbitrary downloads and forged tool-result replay.
- Private query caches are cleared on identity transitions and scoped by user ID; alert storage separates real identities from demo data.
- Security tables grant users only the exact privileges needed; RLS does not protect TRUNCATE.
- Signed Creator passes also require a live service-only registry entry so locking revokes retained cookie copies.
