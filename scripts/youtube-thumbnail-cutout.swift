// Cuts the person out of an image with Apple Vision person segmentation (accurate), or with
// `subject`, lifts whatever stands in front (any object, like long-pressing a photo on an iPhone).
// Used by scripts/youtube-thumbnail.mjs and scripts/collage/cutout.mjs, which compile it.
// Usage: cutout <in.png> <out.png> [subject]   -> RGBA PNG, background transparent, same size as the input
import AppKit
import CoreImage
import Foundation
import Vision

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let subjectMode = CommandLine.arguments.count > 3 && CommandLine.arguments[3] == "subject"
guard let image = CIImage(contentsOf: input) else { fatalError("cannot read \(input.path)") }

let handler = VNImageRequestHandler(ciImage: image, options: [:])
let maskBuffer: CVPixelBuffer
if subjectMode {
	let request = VNGenerateForegroundInstanceMaskRequest()
	try handler.perform([request])
	guard let result = request.results?.first else { fatalError("no subject found") }
	maskBuffer = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
} else {
	let request = VNGeneratePersonSegmentationRequest()
	request.qualityLevel = .accurate
	request.outputPixelFormat = kCVPixelFormatType_OneComponent8
	try handler.perform([request])
	guard let buffer = request.results?.first?.pixelBuffer else { fatalError("no person found") }
	maskBuffer = buffer
}

var mask = CIImage(cvPixelBuffer: maskBuffer)
mask = mask.transformed(by: CGAffineTransform(scaleX: image.extent.width / mask.extent.width, y: image.extent.height / mask.extent.height))
let clear = CIImage(color: .clear).cropped(to: image.extent)
let cut = image.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: clear, kCIInputMaskImageKey: mask])

let context = CIContext()
try context.writePNGRepresentation(of: cut, to: output, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print(output.path)
