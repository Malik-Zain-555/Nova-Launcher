# Preserve compose runtime inspection
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    <init>(...);
}
-keepattributes *Annotation*
