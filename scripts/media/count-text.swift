// Counts the characters of text macOS Vision reads in each image.
// Usage: swift scripts/media/count-text.swift a.png b.webp ...
// Prints one "<characters>\t<path>" line per image (0 when it reads nothing).
import AppKit
import Vision

for path in CommandLine.arguments.dropFirst() {
	guard let image = NSImage(contentsOf: URL(fileURLWithPath: path)),
		let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)
	else {
		FileHandle.standardError.write("count-text: cannot read \(path)\n".data(using: .utf8)!)
		exit(1)
	}
	let request = VNRecognizeTextRequest()
	request.recognitionLevel = .fast
	try VNImageRequestHandler(cgImage: cgImage).perform([request])
	let characters = (request.results ?? [])
		.filter { $0.confidence >= 0.5 }
		.compactMap { $0.topCandidates(1).first?.string.count }
		.reduce(0, +)
	print("\(characters)\t\(path)")
}
