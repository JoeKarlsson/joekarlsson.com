// Cuts the person out of an image with Apple Vision person segmentation (accurate).
// Used by scripts/youtube-thumbnail.mjs, which compiles it. Usage: cutout <in.png> <out.png>   -> RGBA PNG, background transparent, same size as the input
import AppKit
import CoreImage
import Foundation
import Vision

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
guard let image = CIImage(contentsOf: input) else { fatalError("cannot read \(input.path)") }

let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(ciImage: image, options: [:]).perform([request])
guard let maskBuffer = request.results?.first?.pixelBuffer else { fatalError("no person found") }

var mask = CIImage(cvPixelBuffer: maskBuffer)
mask = mask.transformed(by: CGAffineTransform(scaleX: image.extent.width / mask.extent.width, y: image.extent.height / mask.extent.height))
let clear = CIImage(color: .clear).cropped(to: image.extent)
let cut = image.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: clear, kCIInputMaskImageKey: mask])

let context = CIContext()
try context.writePNGRepresentation(of: cut, to: output, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print(output.path)
