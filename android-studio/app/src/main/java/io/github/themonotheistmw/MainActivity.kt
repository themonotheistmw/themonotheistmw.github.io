package io.github.themonotheistmw

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebResourceResponse
import androidx.webkit.WebViewAssetLoader
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationCompat

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var splashLayout: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createChannel()

        val root = FrameLayout(this)

        // WebView (zero Chrome UI, loads bundled offline assets)
        val readerAssets = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = false
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            addJavascriptInterface(NotifyBridge(this@MainActivity), "AndroidBridge")
            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest): WebResourceResponse? {
                    return readerAssets.shouldInterceptRequest(request.url)
                }
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    return request?.url?.let { it.scheme != "https" || it.host != "appassets.androidplatform.net" } ?: true
                }
                override fun onPageFinished(view: WebView?, url: String?) {
                    splashLayout.animate().alpha(0f).setDuration(320).withEndAction {
                        splashLayout.visibility = View.GONE
                    }.start()
                }
            }
            loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
        }

        // Native Splash Screen: THE MONOTHEIST MW (Oxford Blue & Gold)
        splashLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0B1B3D"))
            val monogram = TextView(this@MainActivity).apply {
                text = "M"
                textSize = 44f
                typeface = Typeface.SERIF
                setTextColor(Color.parseColor("#C9A24D"))
                gravity = Gravity.CENTER
            }
            val title = TextView(this@MainActivity).apply {
                text = "THE MONOTHEIST MW"
                textSize = 20f
                letterSpacing = 0.14f
                typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
                setTextColor(Color.parseColor("#FAF6EE"))
                gravity = Gravity.CENTER
                setPadding(0, 24, 0, 8)
            }
            val sub = TextView(this@MainActivity).apply {
                text = "Digital Library & Publications"
                textSize = 13f
                setTextColor(Color.parseColor("#C9A24D"))
                gravity = Gravity.CENTER
            }
            addView(monogram)
            addView(title)
            addView(sub)
        }

        root.addView(webView)
        root.addView(splashLayout)
        setContentView(root)

        // Android Back Navigation integration
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript("window.handleAndroidBack ? window.handleAndroidBack() : 'exit'") { res ->
                    if (res == null || res.contains("exit")) {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            }
        })
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel("monotheist_updates", "The Monotheist Updates", NotificationManager.IMPORTANCE_DEFAULT)
            getSystemService(NotificationManager::class.java).createNotificationChannel(ch)
        }
    }

    class NotifyBridge(private val ctx: Context) {
        @JavascriptInterface
        fun notify(title: String, body: String) {
            val mgr = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val n = NotificationCompat.Builder(ctx, "monotheist_updates")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .build()
            mgr.notify((System.currentTimeMillis() % 10000).toInt(), n)
        }
    }
}
