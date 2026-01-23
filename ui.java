import javax.swing.*;
import java.awt.*;
import java.nio.file.*;
import java.io.*;

public class ui {
    
    private static boolean started = false;
    private static Process bot;
    private static String last_err = "Нет";
    private static String log_str;
    private static JButton start;

    private static void disable_button_for(int sleep_for, Component btn) {
        int i = 0;
        for (; i < sleep_for; i++) {
            // btn.setEnabled(false);
            // System.out.println(i);
        }
    }

    public static void main(String[] args) throws Exception {
        JFrame frame = new JFrame("Админ панель - Aboba bot");

        frame.setVisible(true);
        frame.setSize(500, 500);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLayout(null);

        JButton start = new JButton("Запустить бота");
        JLabel error_msg = new JLabel("Последняя ошибка:\n\n" + last_err);
        JTextArea log_area = new JTextArea();
        JScrollPane scroll = new JScrollPane(log_area);

        frame.add(start);
        frame.add(error_msg);
        frame.add(scroll);

        start.setBounds(15, 15, 150, 430);
        error_msg.setBounds(175, -215, 500, 500);
        scroll.setBounds(185, 60, 280, 380);

        error_msg.setFont(new Font(error_msg.getFont().getName(), Font.PLAIN, 20));

        start.addActionListener(ex -> {
            if (!started) {
                try {
                    started = true;
                    try {
                        bot = Runtime.getRuntime().exec("node main.js");
                    } catch (Exception exx) {
                        last_err = exx.getMessage();
                        System.err.println(exx.getMessage());
                    }
                    start.setText("Бот запущен");
                    disable_button_for(100, start);
                } catch (Exception xe) {
                    last_err = xe.getMessage();
                    JOptionPane.showMessageDialog(frame, "Ошибка - " + xe.getMessage(), "Ошибка", JOptionPane.ERROR_MESSAGE);
                }
            } else if (started) {
                if (bot != null) {
                    try {
                        bot.destroy();
                        start.setText("Бот выключен");
                        started = false;
                    } catch (Exception eex) {
                        last_err = eex.getMessage();
                        JOptionPane.showMessageDialog(frame, "Ошибка - " + eex.getMessage(), "Ошибка", JOptionPane.ERROR_MESSAGE);
                    }
                }
            }
        });

        new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(bot.getInputStream()))) {
                while ((log_str = reader.readLine()) != null) {
                   // log_area.setText(log_str);
                }
            } catch (Exception xee) {
                System.err.println(xee.getMessage());
            }
        }).start();

        new Timer(100, q -> {
            error_msg.setText("Последняя ошибка:\n\n" + last_err);
            // log_area.setText(bot);
        }).start();
    }
}