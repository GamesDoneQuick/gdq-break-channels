# Space Cadet Pinball

This channel is built on a fork of the decompilation project for the original 3D Space Cadet Pinball and Full Tilt! Pinball that can be found at [https://github.com/k4zmu2a/SpaceCadetPinball](https://github.com/k4zmu2a/SpaceCadetPinball).

The file containing the game data is not provided due to copyright reasons and must be supplied by the developer themselves.

To build the bindings and create the data file, you must have an emscripten/emsdk compilation environment setup, and do the following.

1. Clone the fork at [https://github.com/VodBox/SpaceCadetPinball/tree/emscripten](https://github.com/VodBox/SpaceCadetPinball/tree/emscripten)
2. Place game files from a copy of 3D Space Cadet Pinball into the resources folder. (Note: Full Tilt! Pinball will also work, however the channel will display incorrectly due to resolution differences).
3. Run these build commands in the ``SpaceCadetPinball`` folder
    - ``emcmake cmake .``
    - ``cmake --build .``
4. Copy results from the ``SpaceCadetPinball/bin`` folder to ``gdq-break-channels/src/channels/pinball/bin``.
