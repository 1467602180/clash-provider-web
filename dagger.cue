package todoapp

import (
	"dagger.io/dagger"

	"dagger.io/dagger/core"
	"universe.dagger.io/yarn"
)

dagger.#Plan & {
	client:filesystem: {
		"./dist": write: contents: actions.build.build.output
	}

	actions: {
		// Load the todoapp source code
		source: core.#Source & {
			path: "."
			exclude: [
				"node_modules",
				"dist",
				"*.cue",
				"*.md",
				".git",
			]
		}

		// Build todoapp
		build: {
			build:yarn.#Script & {
			name:   "build"
			outputDir: "./dist"
			source: actions.source.output
		}
		}
	}
}
