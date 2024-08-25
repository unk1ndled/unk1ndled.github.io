package main

import (
	"fmt"
	"image"
	_ "image/png"
	"log"
	"math"
	"os"
	"strconv"
)

var (
	SAMPLE_SIZE int = 15
	// Characters representing different light levels, from darkest to brightest
	lightLevels = []rune{' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'}
)

func main() {
	if len(os.Args) == 2 {
		val, err := strconv.Atoi(os.Args[1])
		if err != nil {
			log.Fatal(err)
		}
		if val > 0 {
			SAMPLE_SIZE = val
		}
	}

	// Open the source image
	reader, err := os.Open("input.png")
	if err != nil {
		log.Fatal(err)
	}
	defer reader.Close()

	// Decode the image
	img, _, err := image.Decode(reader)
	if err != nil {
		log.Fatal(err)
	}

	// Get image bounds
	bounds := img.Bounds()
	width, height := bounds.Max.X, bounds.Max.Y

	O_width, O_Height := int(math.Ceil(float64(width)/float64(SAMPLE_SIZE))), int(math.Ceil(float64(height)/float64(SAMPLE_SIZE)))

	// Create HTML file
	outputFile, err := os.Create("embedded.html")
	if err != nil {
		log.Fatal(err)
	}
	defer outputFile.Close()

	// Write HTML header
	fmt.Fprintf(outputFile, `<html>
<head>
<style>
body {
    background-color: black;
    margin: 0;
    padding: 0;
    line-height: 0;
		overflow:hidden
}
.pixel {
    display: inline-block;
    width: 8px;
    height: 8px;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 7px;
    line-height: 8px;
    text-align: center;
}
</style>
</head>
<body>
`)

	for y := 0; y < O_Height; y++ {
		for x := 0; x < O_width; x++ {
			startX, startY := x*SAMPLE_SIZE, y*SAMPLE_SIZE
			endX, endY := min((x+1)*SAMPLE_SIZE, width), min((y+1)*SAMPLE_SIZE, height)
			amount := (endX - startX) * (endY - startY)

			var R, G, B uint64 = 0, 0, 0

			for i := startX; i < endX; i++ {
				for j := startY; j < endY; j++ {
					oldColor := img.At(i, j)
					r, g, b, _ := oldColor.RGBA()

					R += uint64(r >> 8)
					G += uint64(g >> 8)
					B += uint64(b >> 8)
				}
			}
			R /= uint64(amount)
			G /= uint64(amount)
			B /= uint64(amount)

			// Calculate brightness
			brightness := float64(R+G+B) / 3
			// Map brightness to character
			charIndex := int(brightness * float64(len(lightLevels)-1) / 255)
			char := lightLevels[charIndex]

			// Write colored span
			fmt.Fprintf(outputFile, "<span class=\"pixel\" style=\"color: rgb(%d,%d,%d);\">%c</span>", R, G, B, char)
		}
		fmt.Fprintln(outputFile, "<br>")
	}

	// Write HTML footer
	fmt.Fprintf(outputFile, "</body>\n</html>")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
