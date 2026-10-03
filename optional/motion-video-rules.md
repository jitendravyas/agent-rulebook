# Motion graphics video rules

Apply when authoring or changing motion graphics intended for video export, including work previewed in a browser or timeline editor.

## Composition and timing

  * Use the intended output dimensions, aspect ratio, duration, and frame rate as composition constraints. Keep the source timeline and export settings aligned; do not let the preview window size determine the exported layout.
  * Keep essential text and subjects within the intended visible area, accounting for required crops or player overlays. Leave enough readable time at normal playback speed. Adjust layout and timing instead of silently truncating required text.
  * Drive generated animation from the composition's frame or time position, not wall-clock time or rendering speed. Keep random choices and external data stable across renders. For effects that depend on earlier frames, use a supported cache or sequential rendering; do not render frames independently unless their state can be reconstructed.
  * When audio is included, align its timing, trims, and ending with the intended visual sequence. Preserve synchronisation after timing changes; do not unintentionally cut speech, add silence, or distort audio through excessive volume.
  * Avoid rapid, high-contrast flashing; do not add it solely for emphasis.

## Assets and export

  * Ensure required fonts, media, and data are ready before rendering dependent frames. Use supported loading checks with bounded waits. Report missing assets instead of silently exporting placeholders or unintended fallback fonts.
  * When exporting, choose encoding settings compatible with the intended player and delivery requirements, including audio, colour, and transparency where relevant. An MP4 extension alone does not establish those capabilities. Keep editable source separate from the exported file.
  * When delivering an export, verify the file's dimensions, frame rate, duration, and playback, including affected transitions, first and last frames, and audio synchronisation when present. Check for unintended blank frames, cropping, missing assets, or changes from the source composition. A working preview does not prove the export is correct.
