import os
import discord
from discord import app_commands

CHECKLIST_URL = os.environ.get("CHECKLIST_URL", "http://localhost:3000")
TOKEN = os.environ["DISCORD_BOT_TOKEN"]


class ChecklistBot(discord.Client):
    def __init__(self):
        intents = discord.Intents.default()
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        await self.tree.sync()
        print(f"Synced slash commands.")

    async def on_ready(self):
        print(f"Logged in as {self.user} (ID: {self.user.id})")


client = ChecklistBot()


@client.tree.command(name="checklist", description="Open the project checklist board")
async def checklist_command(interaction: discord.Interaction):
    embed = discord.Embed(
        title="📋 Project Checklist",
        description="Track your project tasks and progress.",
        color=0x5865F2,
    )
    embed.set_footer(text="Powered by Checklist Bot")

    view = discord.ui.View()
    view.add_item(
        discord.ui.Button(
            label="📋 Open Checklist",
            style=discord.ButtonStyle.link,
            url=CHECKLIST_URL,
        )
    )

    await interaction.response.send_message(embed=embed, view=view)


client.run(TOKEN)
