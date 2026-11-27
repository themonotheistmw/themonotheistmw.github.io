package mw.themonotheist.publicapp;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.graphics.Color;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String APP_URL = "https://themonotheistmw.github.io/app/public.html";
    private static final String HOST = "themonotheistmw.github.io";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(11,27,61));
        getWindow().setNavigationBarColor(Color.rgb(11,27,61));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(250,246,238));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setCacheMode(WebSettings.LOAD_DEFAULT);
        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                if (request.isForMainFrame()) showOffline();
            }
        });
        setContentView(webView);
        webView.loadUrl(APP_URL);
    }
    private void showOffline() {
        LinearLayout layout = new LinearLayout(this);
        layout.setPadding(48,96,48,48);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(Color.rgb(11,27,61));
        TextView message = new TextView(this);
        message.setText("The Monotheist\n\nUnable to load. Please check your internet connection.");
        message.setTextColor(Color.WHITE);
        message.setTextSize(20);
        layout.addView(message);
        TextView retry = new TextView(this);
        retry.setText("\nRetry");
        retry.setTextColor(Color.rgb(229,200,125));
        retry.setTextSize(20);
        retry.setOnClickListener(v -> { setContentView(webView); webView.loadUrl(APP_URL); });
        layout.addView(retry);
        setContentView(layout);
    }
    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
