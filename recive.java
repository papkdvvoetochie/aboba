import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Clip;
import javax.swing.*;

import java.io.File;
import java.nio.file.*;

public class recive {

    private static void play_sound(final String name) {
        final String final_path = name;

        try {
            File sound = new File(final_path);
            Clip sound_clip = AudioSystem.getClip();
            sound_clip.open(AudioSystem.getAudioInputStream(sound));
            sound_clip.start();
        } catch (Exception ex) {
            System.err.println(ex.getMessage());
        }
    }
    public static void main(String[] args) {
        boolean gui = false;

        if (gui) {
            JFrame frame = new JFrame();

            frame.setVisible(true);
            frame.setSize(400, 200);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            JLabel donate = new JLabel(args[0]);
        
            frame.add(donate);
        } else {
            play_sound("sounds/" + args[1]);
        }
    }
}