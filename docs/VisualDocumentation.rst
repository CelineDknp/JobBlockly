How to change the maze's visuals
================================

## Files you'll need (all images in png form) :
- A background (see ``background.png`` in the folder)
- A tiles file, with all possible intersections and, if wanted, two "passive" entities to populate the map (see ``tiles.png``)
- A sprite for the avatar, with the character from different angles (see ``avatar.png``)
- A marker gif representing the goal of the maze idle, when the character is on another tile (see ``goalIdle.gif``)
- A gif with the marker when it is reached by the character (see ``goal.gif``)
- A gif representing an obstacle idle, when the character is on another tile (see ``obstacleIdle.gif``)
- A gif representing an obstacle "killing" the character, ending the game (see ``obstacle.gif``)

You may add :
- mp3 and ogg files with a sound to be played when the character hit an obstacle (listen to ``obstacle.mp3`` or ``obstacle.ogg``)
- mp3 and ogg files with a sound to be played when the character looses the game without hitting an obstacle (listen to ``failure.mp3`` or ``failure.ogg``)
- mp3 and ogg files with a sound to be played when the character wins the game (listen to ``win.mp3`` or ``win.ogg``)

All of those files can be put in the task folder, under : ``taskName/public/maze``

## Files to modify

The only file to modify is ``maze.js``. At the beginning (line 37 to 52), you'll eventually have to tweak a few parameters and to replace the names of the files with your own files, like so :
```
	sprite: task_directory_path + 'maze/avatar.png',
```

Will become :
```
	sprite: task_directory_path + 'maze/myAvatarName.png',
```

Here is a break down of all the variables and what they correspond to :
- sprite: your avatar (png)
- tiles: the tiles to show the paths (png)
- marker: the marker or goal of the maze when idle (gif)
- goalAnimation: the marker when the game is won (gif)
- obstacleIdle: the obstacle when idle (gif)
- obstacleAnimation: the obstacle killing the character (gif)
- obstacleScale: the scale of the obstacle (1 = same as the gif, < 1 = smaller, > 1 larger)
- background: the background for the paze (png)
- graph: **TODO : determine**
- look: **TODO : determine**
- obstacleSound: both sounds file for when the character hits an obstacle (mp3 and ogg)
- winSound: both sounds file for when the character wins de game (mp3 and ogg)
- crashSound: both sounds file for when the character looses the game (mp3 and ogg)
- crashType: **TODO : determine**