#!/bin/bash

# Set base directories
IMG_BASE="website/assets/img/posts"
POSTS_BASE="website/_posts"

# Loop through all "featured.webp" images in posts directories
find "$IMG_BASE" -type f -name "featured.webp" | while read -r img; do
    # Extract directory name (post slug)
    POST_DIR=$(dirname "$img")
    POST_NAME=$(basename "$POST_DIR")

    # Define LQIP output file path
    LQIP_IMG="$POST_DIR/featured_lqip.webp"

    # Generate LQIP image
    convert "$img" -resize 50x -blur 0x8 -quality 20 "$LQIP_IMG"

    # Check if image was generated
    if [[ -f "$LQIP_IMG" ]]; then
        echo "Generated: $LQIP_IMG"
    else
        echo "Error generating: $LQIP_IMG"
        continue
    fi

    # Construct expected markdown file path
    POST_FILE="$POSTS_BASE/$POST_NAME.md"

    # Verify markdown file exists
    if [[ ! -f "$POST_FILE" ]]; then
        echo "Warning: Markdown file not found: $POST_FILE"
        continue
    fi

    # Define the new LQIP path (relative for Markdown frontmatter)
    LQIP_PATH="/assets/img/posts/$POST_NAME/featured_lqip.webp"

    # Update Markdown file: replace `lqip: ` with the correct path (without quotes)
    sed -i "s|lqip:.*|lqip: $LQIP_PATH|" "$POST_FILE"

    echo "Updated Markdown file: $POST_FILE with LQIP path: $LQIP_PATH"
done

echo "LQIP generation & markdown update completed!"
