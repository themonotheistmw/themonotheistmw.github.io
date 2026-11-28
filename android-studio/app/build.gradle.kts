import java.util.zip.GZIPInputStream
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "io.github.themonotheistmw"
    compileSdk = 34
    defaultConfig {
        applicationId = "io.github.themonotheistmw"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1.0"
    }
    buildTypes {
        release { isMinifyEnabled = false }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
dependencies {
    implementation("androidx.webkit:webkit:1.11.0")
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
}

val bundledAssets = layout.buildDirectory.dir("generated/readerAssets")
val expandCatalog by tasks.registering {
    val source = layout.projectDirectory.file("catalog.js.gz")
    val output = bundledAssets.map { it.file("www/library-data.js") }
    inputs.file(source)
    outputs.file(output)
    doLast {
        val file = output.get().asFile
        file.parentFile.mkdirs()
        GZIPInputStream(source.asFile.inputStream()).use { input ->
            file.outputStream().use { input.copyTo(it) }
        }
    }
}
android.sourceSets.getByName("main").assets.srcDir(bundledAssets)
tasks.named("preBuild").configure { dependsOn(expandCatalog) }
